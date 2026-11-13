import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

// The router is called directly with `createCaller`, the same procedures the
// browser reaches over HTTP, minus the transport. Kinde, Prisma and
// UploadThing are mocks, so each test controls who is signed in and what the
// database returns, then checks what the router asked the database to do.
// The most important thing checked here: every query is scoped to the
// signed-in user, so one user can never read or change another's files.
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  deleteFiles: vi.fn(),
  db: {
    user: { findFirst: vi.fn(), create: vi.fn() },
    file: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    message: { findMany: vi.fn() },
  },
}));

vi.mock("@kinde-oss/kinde-auth-nextjs/server", () => ({
  getKindeServerSession: () => ({ getUser: mocks.getUser }),
}));
vi.mock("@/db", () => ({ db: mocks.db }));
vi.mock("uploadthing/server", () => ({ utapi: { deleteFiles: mocks.deleteFiles } }));
vi.mock("@/lib/stripe", () => ({ stripe: {}, getUserSubscriptionPlan: vi.fn() }));

import { appRouter } from "./index";

const ALICE = { id: "kp_alice", email: "alice@example.com" };
const caller = appRouter.createCaller({});

/** Runs a call and returns the tRPC error code it failed with. */
async function errorCode(call: Promise<unknown>) {
  try {
    await call;
  } catch (err) {
    if (err instanceof TRPCError) return err.code;
    throw err;
  }
  throw new Error("expected the call to fail");
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue(ALICE);
});

describe("signed out", () => {
  it("refuses every private procedure", async () => {
    mocks.getUser.mockResolvedValue(null);

    expect(await errorCode(caller.getUserFiles())).toBe("UNAUTHORIZED");
    expect(await errorCode(caller.deleteFile({ id: "f1" }))).toBe("UNAUTHORIZED");
    expect(mocks.db.file.findMany).not.toHaveBeenCalled();
  });

  it("refuses authCallback", async () => {
    mocks.getUser.mockResolvedValue(null);

    expect(await errorCode(caller.authCallback())).toBe("UNAUTHORIZED");
  });
});

describe("authCallback", () => {
  it("creates the user row on first sign-in", async () => {
    mocks.db.user.findFirst.mockResolvedValue(null);

    await expect(caller.authCallback()).resolves.toEqual({ success: true });
    expect(mocks.db.user.create).toHaveBeenCalledWith({
      data: { id: ALICE.id, email: ALICE.email },
    });
  });

  it("does not create it twice", async () => {
    mocks.db.user.findFirst.mockResolvedValue({ id: ALICE.id });

    await caller.authCallback();
    expect(mocks.db.user.create).not.toHaveBeenCalled();
  });
});

describe("getUserFiles", () => {
  it("lists only the signed-in user's files, newest first", async () => {
    mocks.db.file.findMany.mockResolvedValue([]);

    await caller.getUserFiles();

    expect(mocks.db.file.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: ALICE.id },
        orderBy: { createdAt: "desc" },
      })
    );
  });
});

describe("getUploadUsage", () => {
  it("counts this user's uploads since the start of the month", async () => {
    mocks.db.file.count.mockResolvedValue(3);

    await expect(caller.getUploadUsage()).resolves.toEqual({ used: 3 });
    const { where } = mocks.db.file.count.mock.calls[0][0];
    expect(where.userId).toBe(ALICE.id);
    expect(where.createdAt.gte.getUTCDate()).toBe(1);
  });
});

describe("renameFile", () => {
  it("renames only a file the user owns, in one query", async () => {
    mocks.db.file.updateMany.mockResolvedValue({ count: 1 });

    await expect(caller.renameFile({ id: "f1", name: "  Notes  " })).resolves.toEqual({
      id: "f1",
      name: "Notes",
    });
    expect(mocks.db.file.updateMany).toHaveBeenCalledWith({
      where: { id: "f1", userId: ALICE.id },
      data: { name: "Notes" },
    });
  });

  it("answers NOT_FOUND for someone else's file", async () => {
    // The ownership filter matched nothing.
    mocks.db.file.updateMany.mockResolvedValue({ count: 0 });

    expect(await errorCode(caller.renameFile({ id: "bobs", name: "x" }))).toBe("NOT_FOUND");
  });

  it("rejects a blank name before touching the database", async () => {
    expect(await errorCode(caller.renameFile({ id: "f1", name: "   " }))).toBe("BAD_REQUEST");
    expect(mocks.db.file.updateMany).not.toHaveBeenCalled();
  });
});

describe("deleteFile", () => {
  const file = { id: "f1", key: "upload-key", userId: ALICE.id };

  it("deletes the row and then the upload", async () => {
    mocks.db.file.findFirst.mockResolvedValue(file);

    await caller.deleteFile({ id: "f1" });

    expect(mocks.db.file.findFirst).toHaveBeenCalledWith({
      where: { id: "f1", userId: ALICE.id },
    });
    expect(mocks.db.file.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
    expect(mocks.deleteFiles).toHaveBeenCalledWith("upload-key");
  });

  it("does nothing to someone else's file", async () => {
    mocks.db.file.findFirst.mockResolvedValue(null);

    expect(await errorCode(caller.deleteFile({ id: "bobs" }))).toBe("NOT_FOUND");
    expect(mocks.db.file.delete).not.toHaveBeenCalled();
    expect(mocks.deleteFiles).not.toHaveBeenCalled();
  });

  it("still succeeds if UploadThing fails, since the row is already gone", async () => {
    mocks.db.file.findFirst.mockResolvedValue(file);
    mocks.deleteFiles.mockRejectedValue(new Error("UploadThing down"));
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(caller.deleteFile({ id: "f1" })).resolves.toEqual(file);
    quiet.mockRestore();
  });
});

describe("getFileMessages", () => {
  const message = (n: number) => ({ id: `m${n}`, text: `${n}`, isUserMessage: true, createdAt: new Date() });

  it("refuses messages of a file the user does not own", async () => {
    mocks.db.file.findFirst.mockResolvedValue(null);

    expect(await errorCode(caller.getFileMessages({ fileId: "bobs" }))).toBe("NOT_FOUND");
    expect(mocks.db.message.findMany).not.toHaveBeenCalled();
  });

  // Paging: ask for one more row than the page size. If it comes back there
  // is another page, and that extra row's id is where the next page starts.
  it("returns a cursor when there is another page", async () => {
    mocks.db.file.findFirst.mockResolvedValue({ id: "f1" });
    mocks.db.message.findMany.mockResolvedValue([1, 2, 3].map(message));

    const page = await caller.getFileMessages({ fileId: "f1", limit: 2 });

    expect(mocks.db.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3, where: { fileId: "f1" } })
    );
    expect(page.messages.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(page.nextCursor).toBe("m3");
  });

  it("returns no cursor on the last page", async () => {
    mocks.db.file.findFirst.mockResolvedValue({ id: "f1" });
    mocks.db.message.findMany.mockResolvedValue([1, 2].map(message));

    const page = await caller.getFileMessages({ fileId: "f1", limit: 2 });

    expect(page.messages).toHaveLength(2);
    expect(page.nextCursor).toBeUndefined();
  });
});

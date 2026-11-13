"use client";

import React from "react";
import Link from "next/link";
import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { trpc } from "@/app/_trpc/client";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";

interface chatWrapperProps {
  fileId: string;
}

/** Shown in place of the messages while the file is not ready to chat with. */
const ChatStatus = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex h-full flex-col bg-background">
    <div
      role="status"
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center"
    >
      {icon}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
    <ChatInput isDisabled />
  </div>
);

const ChatWrapper = ({ fileId }: chatWrapperProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    }
  );

  if (isLoading)
    return (
      <ChatStatus
        icon={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
        title="Loading…"
        description="We're preparing your PDF."
      />
    );

  if (data?.status === "PROCESSING")
    return (
      <ChatStatus
        icon={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
        title="Processing PDF…"
        description="This won't take long."
      />
    );

  if (data?.status === "FAILED")
    return (
      <ChatStatus
        icon={<XCircle className="h-8 w-8 text-red-500" />}
        title="This PDF couldn't be processed"
        description="It may have more pages than your plan allows, or contain no selectable text."
        action={
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "secondary",
              className: "mt-4",
            })}
          >
            <ChevronLeft className="mr-1.5 h-3 w-3" />
            Back to files
          </Link>
        }
      />
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="flex h-full flex-col bg-background">
        <Messages fileId={fileId} />
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;

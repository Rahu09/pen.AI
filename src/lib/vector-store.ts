import { randomUUID } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { Document } from "@langchain/core/documents";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { VectorStore } from "@langchain/core/vectorstores";
import { db } from "@/db";
import { GeminiEmbeddings } from "@/lib/embeddings";

// Rows are inserted in batches to keep each SQL statement a reasonable size
// (one embedding is about 20 KB as text).
const INSERT_BATCH_SIZE = 50;

/** pgvector accepts a vector as the text literal `[0.1,0.2,...]`. */
const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

type ChunkRow = {
  id: string;
  content: string;
  pageNumber: number;
  distance: number;
};

/**
 * LangChain vector store backed by the `DocumentChunk` table (pgvector, in the
 * same Postgres database as everything else). See docs/DECISIONS.md D-008.
 *
 * Extending LangChain's `VectorStore` means the rest of the app can use the
 * standard LangChain pieces on top of it (`addDocuments`, `asRetriever`,
 * chains), while the SQL that actually runs is visible here.
 *
 * One instance is bound to one file. Every read and write is scoped to that
 * `fileId`, so a search can never return another file's text. Callers must
 * check that the user owns the file before creating the store.
 *
 * What happens underneath:
 *   - Storing: each chunk of text is sent to the embedding model, which returns
 *     a list of numbers (a vector) representing its meaning. Text and vector
 *     are saved in one row.
 *   - Searching: the question is embedded the same way, then Postgres orders
 *     the file's rows by how close each stored vector is to the question's
 *     vector and returns the closest few.
 */
export class DocumentChunkVectorStore extends VectorStore {
  constructor(
    embeddings: EmbeddingsInterface,
    private readonly fileId: string
  ) {
    super(embeddings, {});
  }

  _vectorstoreType(): string {
    return "prisma-pgvector";
  }

  /** Embeds the documents, then stores text and vectors. */
  async addDocuments(documents: Document[]): Promise<void> {
    if (documents.length === 0) return;

    const vectors = await this.embeddings.embedDocuments(
      documents.map((document) => document.pageContent)
    );

    await this.addVectors(vectors, documents);
  }

  /** Stores already-computed vectors next to their text. */
  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    for (let start = 0; start < documents.length; start += INSERT_BATCH_SIZE) {
      const rows = documents
        .slice(start, start + INSERT_BATCH_SIZE)
        .map((document, offset) => {
          const vector = toVectorLiteral(vectors[start + offset]);
          const pageNumber = Number(document.metadata.pageNumber ?? 0);

          // Prisma cannot write a vector column through its typed API, so this
          // is raw SQL. Values are passed as parameters, never concatenated.
          return Prisma.sql`(${randomUUID()}, ${
            document.pageContent
          }, ${pageNumber}, ${vector}::vector, ${this.fileId})`;
        });

      await db.$executeRaw`
        INSERT INTO "DocumentChunk" ("id", "content", "pageNumber", "embedding", "fileId")
        VALUES ${Prisma.join(rows)}
      `;
    }
  }

  /**
   * Returns the `k` chunks of this file closest in meaning to `query`.
   *
   * `<=>` is pgvector's cosine-distance operator: 0 means same direction
   * (same meaning), 2 means opposite. The score returned is cosine similarity,
   * `1 - distance`, so higher is better.
   *
   * There is no vector index on purpose. The WHERE clause narrows the search
   * to one file (at most a few hundred rows, using the fileId index), and
   * comparing against that few rows exactly is instant. An approximate index
   * such as HNSW only pays off when searching across very many vectors.
   */
  async similaritySearchVectorWithScore(
    query: number[],
    k: number
  ): Promise<[Document, number][]> {
    const queryVector = toVectorLiteral(query);

    const rows = await db.$queryRaw<ChunkRow[]>`
      SELECT
        "id",
        "content",
        "pageNumber",
        "embedding" <=> ${queryVector}::vector AS "distance"
      FROM "DocumentChunk"
      WHERE "fileId" = ${this.fileId}
        AND "embedding" IS NOT NULL
      ORDER BY "distance" ASC
      LIMIT ${k}
    `;

    return rows.map((row) => [
      new Document({
        id: row.id,
        pageContent: row.content,
        metadata: { pageNumber: row.pageNumber, fileId: this.fileId },
      }),
      1 - Number(row.distance),
    ]);
  }
}

let embeddings: GeminiEmbeddings | undefined;

/** Created on first use so that importing this file never needs the API key. */
const getEmbeddings = () => {
  embeddings ??= new GeminiEmbeddings();
  return embeddings;
};

/** The vector store for one file's chunks. */
export const getVectorStore = (fileId: string) =>
  new DocumentChunkVectorStore(getEmbeddings(), fileId);

// Every model name and retrieval setting in one place.
// See docs/DECISIONS.md D-008 (pgvector), D-009 (LangChain), D-013 (Gemini).

// Chat model that writes the answer. Checked against Google's model list on
// 2026-11-13: their fastest, lowest-cost current model, available on the free
// tier of the Gemini API.
export const CHAT_MODEL = "gemini-3.5-flash-lite";

// Embedding model. It can return 768, 1536 or 3072 numbers per text; we ask
// for 1536. That number must match the vector(N) column in
// prisma/schema.prisma (DocumentChunk.embedding). Changing either one means a
// migration and re-embedding every stored chunk.
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 1536;

// Each PDF page is split into overlapping chunks before embedding, so a search
// can match a paragraph instead of a whole page. Sizes are in characters.
export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

// How many chunks are retrieved and put into the prompt for each question.
export const RETRIEVAL_TOP_K = 4;

// How many previous messages are sent along as conversation history.
export const HISTORY_MESSAGES = 6;

import { Embeddings } from "@langchain/core/embeddings";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/config/ai";

type GoogleEmbeddingsFields = NonNullable<
  ConstructorParameters<typeof GoogleGenerativeAIEmbeddings>[0]
>;

const createGoogleEmbeddings = (
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"
) =>
  new GoogleGenerativeAIEmbeddings({
    model: EMBEDDING_MODEL,
    outputDimensionality: EMBEDDING_DIMENSIONS,
    taskType: taskType as GoogleEmbeddingsFields["taskType"],
  });

/**
 * Turns text into vectors with Google's Gemini embedding model.
 *
 * An embedding is a list of numbers that represents what a piece of text
 * means. Texts with similar meaning get lists that point in a similar
 * direction, which is what the vector search compares.
 *
 * Gemini embeds a stored passage and a search question slightly differently
 * (a "task type"), because a short question and the long passage that answers
 * it do not look alike as text. LangChain's Google class takes one task type
 * per instance, so this class holds two instances and uses the right one:
 * documents when a PDF is stored, queries when a question is asked.
 *
 * It also checks every vector's length. LangChain's Google class returns an
 * empty vector when a batch fails instead of throwing; without the check a
 * failed batch would only surface later as a confusing database error.
 */
export class GeminiEmbeddings extends Embeddings {
  private readonly forDocuments = createGoogleEmbeddings("RETRIEVAL_DOCUMENT");
  private readonly forQueries = createGoogleEmbeddings("RETRIEVAL_QUERY");

  constructor() {
    super({});
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const vectors = await this.forDocuments.embedDocuments(texts);
    vectors.forEach(assertVectorSize);
    return vectors;
  }

  async embedQuery(text: string): Promise<number[]> {
    const vector = await this.forQueries.embedQuery(text);
    assertVectorSize(vector);
    return vector;
  }
}

function assertVectorSize(vector: number[]) {
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding failed: expected ${EMBEDDING_DIMENSIONS} numbers, got ${vector.length}. ` +
        "Check GOOGLE_API_KEY and the Gemini API rate limits."
    );
  }
}

import { db } from "@/db";
import { getVectorStore } from "@/lib/vector-store";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { CHAT_MODEL, HISTORY_MESSAGES, RETRIEVAL_TOP_K } from "@/config/ai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { Document } from "@langchain/core/documents";
import {
  AIMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogle } from "@langchain/google";
import { NextRequest } from "next/server";

type ChainInput = {
  question: string;
  history: BaseMessage[];
};

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You answer questions about a PDF the user has uploaded.
Answer in markdown, using only the context below and the conversation so far.
Each piece of context starts with the page it came from.
If the answer is not in the context, say that you don't know. Do not make one up.

CONTEXT:
{context}`,
  ],
  new MessagesPlaceholder("history"),
  ["human", "{question}"],
]);

/** Joins the retrieved chunks into one block of text, labelled by page. */
const formatContext = (documents: Document[]) =>
  documents
    .map(
      (document) =>
        `[Page ${document.metadata.pageNumber}]\n${document.pageContent}`
    )
    .join("\n\n---\n\n");

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = getUser();

  const { id: userId } = user;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  // The latest few messages, oldest first. Read before the new question is
  // saved so the question is not sent twice.
  const recentMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: HISTORY_MESSAGES,
  });

  const history = recentMessages
    .reverse()
    .map((msg) =>
      msg.isUserMessage ? new HumanMessage(msg.text) : new AIMessage(msg.text)
    );

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // The retriever embeds the question and returns this file's closest chunks.
  const retriever = getVectorStore(file.id).asRetriever({ k: RETRIEVAL_TOP_K });

  // Reads GOOGLE_API_KEY from the environment.
  const model = new ChatGoogle({ model: CHAT_MODEL });

  // The whole retrieval-augmented generation pipeline as one chain:
  //   1. look up context for the question (and pass question + history along)
  //   2. fill in the prompt
  //   3. call the model
  //   4. reduce the model's output to plain text
  const chain = RunnableSequence.from<ChainInput, string>([
    {
      context: async (input: ChainInput) =>
        formatContext(await retriever.invoke(input.question)),
      question: (input: ChainInput) => input.question,
      history: (input: ChainInput) => input.history,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const answerStream = await chain.stream({ question: message, history });

  // Forward the answer to the browser piece by piece, and save the complete
  // answer once the model has finished.
  const encoder = new TextEncoder();
  let answer = "";

  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const piece of answerStream) {
          answer += piece;
          controller.enqueue(encoder.encode(piece));
        }

        await db.message.create({
          data: {
            text: answer,
            isUserMessage: false,
            fileId,
            userId,
          },
        });

        controller.close();
      } catch (err) {
        console.error("Answer stream failed", err);
        controller.error(err);
      }
    },
  });

  return new Response(responseStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeClient = async () => {
  const pinecone = new Pinecone({
    apiKey: "8abcd2c8-1a52-4757-ad3d-a26b95d668ed",
    environment: "gcp-starter",
  });

  return pinecone;
};

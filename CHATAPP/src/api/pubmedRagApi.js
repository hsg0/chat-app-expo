// CHATAPP/src/api/pubmedRagApi.js

import apiClient from "./apiClient";
import { getToken } from "./authStorage";

export async function askPubMedRag({
  message,
  history = [],
  maximumResults,
}) {
  const token = await getToken();

  if (!token) {
    throw new Error("Sign in to use PubMed RAG chat.");
  }

  const response = await apiClient.post(
    "/api/rag/pubmed/chat",
    {
      message,
      history,
      maximumResults,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 60000,
    }
  );

  return response.data;
}

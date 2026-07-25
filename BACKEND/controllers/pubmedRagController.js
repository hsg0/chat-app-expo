// BACKEND/controllers/pubmedRagController.js
//
/*
WHAT:
  Receives PubMed RAG chat requests.

WHY:
  Keeps HTTP request and response handling separate from PubMed retrieval.

HOW:
  Validates basic request values and calls pubmedRagService.js.
*/

import { runPubMedRagChat } from "../services/pubmedRagService.js";

export async function chatWithPubMedRag(req, res) {
  try {
    const {
      message,
      history = [],
      maximumResults = 8,
    } = req.body || {};

    const result = await runPubMedRagChat({
      message,
      history,
      maximumResults,
    });

    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      retrievedCount: result.retrievedCount,
      model: result.model,
    });
  } catch (error) {
    console.error("PubMed RAG chat error:", error);

    const statusCode = Number(error.statusCode) || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Something went wrong while searching PubMed.",
    });
  }
}

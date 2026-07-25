// BACKEND/controllers/chatAppController.js
//
// WHAT:
// HTTP handlers for chat sessions with the fictional medication agent.
//
// WHY:
// Supports starting a thread, continuing a thread, reading history,
// and requesting a short summary — separate from the single-shot
// /api/practice-medications/chat endpoint.
//
// HOW:
// Stores conversation turns in memory by threadId, then invokes
// practiceMedicationAgent with the accumulated messages.
//
// IMPORTANT:
// In-memory threads reset when the server restarts.
// All medication answers remain fictional practice data only.

import { randomUUID } from "crypto";

import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { practiceMedicationAgent } from "../agents/practiceMedicationAgent.js";

const MAXIMUM_MESSAGE_LENGTH = 2000;
const MAXIMUM_HISTORY_MESSAGES = 20;

const conversationThreads = new Map();

const FICTIONAL_DISCLAIMER =
  "All medications returned by this endpoint are fictional software-development records and must not be used as medical guidance.";

function cleanMessage(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getPlainTextFromMessageContent(messageContent) {
  if (typeof messageContent === "string") {
    return messageContent.trim();
  }

  if (!Array.isArray(messageContent)) {
    return "";
  }

  return messageContent
    .map((contentPart) => {
      if (
        contentPart &&
        typeof contentPart === "object" &&
        contentPart.type === "text" &&
        typeof contentPart.text === "string"
      ) {
        return contentPart.text;
      }

      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function findFinalAssistantResponse(messages) {
  if (!Array.isArray(messages)) {
    return "";
  }

  for (
    let messageIndex = messages.length - 1;
    messageIndex >= 0;
    messageIndex -= 1
  ) {
    const message = messages[messageIndex];

    const messageType =
      typeof message?._getType === "function" ? message._getType() : "";

    if (messageType !== "ai") {
      continue;
    }

    const messageText = getPlainTextFromMessageContent(message.content);

    if (messageText) {
      return messageText;
    }
  }

  return "";
}

function getOrCreateThread(threadId) {
  if (!conversationThreads.has(threadId)) {
    conversationThreads.set(threadId, {
      threadId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    });
  }

  return conversationThreads.get(threadId);
}

function buildLangChainMessages(threadMessages) {
  return threadMessages
    .slice(-MAXIMUM_HISTORY_MESSAGES)
    .map((entry) => {
      if (entry.role === "assistant") {
        return new AIMessage(entry.content);
      }

      return new HumanMessage(entry.content);
    });
}

function validateIncomingMessage(message) {
  const userMessage = cleanMessage(message);

  if (!userMessage) {
    return {
      ok: false,
      statusCode: 400,
      message: "Please provide a message.",
    };
  }

  if (userMessage.length > MAXIMUM_MESSAGE_LENGTH) {
    return {
      ok: false,
      statusCode: 400,
      message: `The message must be ${MAXIMUM_MESSAGE_LENGTH.toLocaleString()} characters or fewer.`,
    };
  }

  return {
    ok: true,
    userMessage,
  };
}

async function runAgentForThread(thread, userMessage) {
  thread.messages.push({
    role: "user",
    content: userMessage,
    createdAt: new Date().toISOString(),
  });

  const graphResult = await practiceMedicationAgent.invoke({
    messages: buildLangChainMessages(thread.messages),
  });

  const assistantResponse = findFinalAssistantResponse(graphResult.messages);

  if (!assistantResponse) {
    thread.messages.pop();
    throw new Error(
      "The practice medication assistant completed without producing a response."
    );
  }

  thread.messages.push({
    role: "assistant",
    content: assistantResponse,
    createdAt: new Date().toISOString(),
  });

  thread.updatedAt = new Date().toISOString();

  return assistantResponse;
}

export async function chatAppController(req, res) {
  try {
    const validation = validateIncomingMessage(req.body?.message);

    if (!validation.ok) {
      return res.status(validation.statusCode).json({
        success: false,
        message: validation.message,
      });
    }

    const threadId = randomUUID();
    const thread = getOrCreateThread(threadId);

    console.log(`Chat started. Thread ID: ${threadId}`);

    const response = await runAgentForThread(thread, validation.userMessage);

    return res.status(200).json({
      success: true,
      threadId,
      response,
      disclaimer: FICTIONAL_DISCLAIMER,
    });
  } catch (error) {
    console.error("chatAppController error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to start chat with the practice medication agent.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function chatThreadIdController(req, res) {
  try {
    const threadId = cleanMessage(req.params?.threadId);
    const validation = validateIncomingMessage(req.body?.message);

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: "A threadId is required.",
      });
    }

    if (!conversationThreads.has(threadId)) {
      return res.status(404).json({
        success: false,
        message: "No chat thread was found with that threadId.",
      });
    }

    if (!validation.ok) {
      return res.status(validation.statusCode).json({
        success: false,
        message: validation.message,
      });
    }

    const thread = conversationThreads.get(threadId);
    const response = await runAgentForThread(thread, validation.userMessage);

    return res.status(200).json({
      success: true,
      threadId,
      response,
      disclaimer: FICTIONAL_DISCLAIMER,
    });
  } catch (error) {
    console.error("chatThreadIdController error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to continue chat with the practice medication agent.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function chatAppHistoryController(req, res) {
  try {
    const threadId = cleanMessage(req.body?.threadId || req.query?.threadId);

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: "A threadId is required.",
      });
    }

    if (!conversationThreads.has(threadId)) {
      return res.status(404).json({
        success: false,
        message: "No chat thread was found with that threadId.",
      });
    }

    const thread = conversationThreads.get(threadId);

    return res.status(200).json({
      success: true,
      threadId: thread.threadId,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      messageCount: thread.messages.length,
      messages: thread.messages,
      disclaimer: FICTIONAL_DISCLAIMER,
    });
  } catch (error) {
    console.error("chatAppHistoryController error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function chatAppSummaryController(req, res) {
  try {
    const threadId = cleanMessage(req.body?.threadId || req.query?.threadId);

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: "A threadId is required.",
      });
    }

    if (!conversationThreads.has(threadId)) {
      return res.status(404).json({
        success: false,
        message: "No chat thread was found with that threadId.",
      });
    }

    const thread = conversationThreads.get(threadId);

    if (thread.messages.length === 0) {
      return res.status(200).json({
        success: true,
        threadId,
        summary: "This chat thread has no messages yet.",
        disclaimer: FICTIONAL_DISCLAIMER,
      });
    }

    const conversationText = thread.messages
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
      .join("\n\n");

    const summaryPrompt =
      "Summarize this fictional medication catalogue chat in 3 to 5 short bullets. " +
      "Remind the reader that all products discussed are fictional practice data. " +
      "Do not invent products that are not in the chat.\n\n" +
      conversationText;

    const graphResult = await practiceMedicationAgent.invoke({
      messages: [new HumanMessage(summaryPrompt)],
    });

    const summary = findFinalAssistantResponse(graphResult.messages);

    if (!summary) {
      return res.status(500).json({
        success: false,
        message: "Unable to create a chat summary.",
      });
    }

    return res.status(200).json({
      success: true,
      threadId,
      summary,
      disclaimer: FICTIONAL_DISCLAIMER,
    });
  } catch (error) {
    console.error("chatAppSummaryController error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

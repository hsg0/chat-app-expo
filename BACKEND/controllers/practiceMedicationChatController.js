// BACKEND/controllers/practiceMedicationChatController.js
//
// WHAT:
// Receives HTTP chat requests and runs the LangGraph medication agent.
//
// WHY:
// Keeps Express request handling separate from:
// - LangGraph workflow logic
// - LangChain tools
// - MongoDB queries
//
// HOW:
// 1. Read and validate the user's message.
// 2. Convert it into a LangChain HumanMessage.
// 3. Run the LangGraph agent.
// 4. Find the final assistant message.
// 5. Return a clean JSON response.
//
// IMPORTANT:
// This controller works only with fictional medication practice data.
// It must never present the results as real medical guidance.

import { HumanMessage } from "@langchain/core/messages";

import { practiceMedicationAgent } from "../agents/practiceMedicationAgent.js";

// OpenAI message content is usually a string.
//
// Some models can return content as an array of content blocks.
// This helper safely converts either format into plain text.
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

// Find the final AI response from the completed graph.
//
// The graph state can contain:
// - HumanMessage
// - AIMessage with tool calls
// - ToolMessage
// - final AIMessage
//
// We search backward for the last AI message containing readable text.
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

export async function chatWithPracticeMedicationAgent(req, res) {
  try {
    const userMessage =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message.",
      });
    }

    if (userMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "The message must be 2,000 characters or fewer.",
      });
    }

    const graphResult = await practiceMedicationAgent.invoke({
      messages: [new HumanMessage(userMessage)],
    });

    const assistantResponse = findFinalAssistantResponse(graphResult.messages);

    if (!assistantResponse) {
      console.error(
        "Practice medication agent completed without a final text response."
      );

      return res.status(500).json({
        success: false,
        message:
          "The practice medication assistant completed without producing a response.",
      });
    }

    return res.status(200).json({
      success: true,

      response: assistantResponse,

      disclaimer:
        "All medications returned by this endpoint are fictional software-development records and must not be used as medical guidance.",
    });
  } catch (error) {
    console.error("Practice medication chat controller error:", error);

    return res.status(500).json({
      success: false,

      message:
        "The practice medication assistant could not complete the request.",

      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

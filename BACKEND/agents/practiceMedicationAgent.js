// BACKEND/agents/practiceMedicationAgent.js
//
// WHAT:
// Creates the LangGraph workflow for the fictional medication assistant.
//
// WHY:
// LangChain gives us the OpenAI model and tool-calling ability.
// LangGraph controls the workflow:
// - send messages to the model
// - detect tool requests
// - execute tools
// - return tool results to the model
// - stop when the final answer is ready
//
// HOW:
// START
//   ↓
// medicationAssistant
//   ├── tool requested → tools → medicationAssistant
//   └── no tool requested → END
//
// IMPORTANT:
// This assistant works only with fictional practice medications.
// It must never present the dataset as real medical information.

import {
  END,
  START,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";

import { ChatOpenAI } from "@langchain/openai";

import { SystemMessage } from "@langchain/core/messages";

import { practiceMedicationTools } from "../tools/practiceMedicationTools.js";

// Create the OpenAI model.
//
// temperature: 0
// Makes the model more predictable for tool selection,
// database searches, and structured workflows.
const practiceMedicationModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: 0,
});

// Give the model access to only our approved tools.
//
// The model cannot directly access MongoDB.
// It can only request one of these controlled functions.
const practiceMedicationModelWithTools =
  practiceMedicationModel.bindTools(practiceMedicationTools);

// These instructions are added before every conversation.
const practiceMedicationSystemMessage = new SystemMessage(`
You are a fictional medication catalogue assistant used for software-development training.

Your job is to help users search, inspect, filter, and compare fictional medication products stored in MongoDB.

Rules:

1. Every product in this database is fictional practice data.
2. Never describe a fictional product as real, approved, medically safe, or medically effective.
3. Never diagnose a medical condition.
4. Never prescribe medication.
5. Never provide real dosage instructions.
6. Use the available tools whenever the user asks to find, search, filter, compare, or inspect medication records.
7. Never invent medication names, prices, warnings, stock levels, ingredients, or product codes.
8. Base product information only on tool results.
9. Clearly tell the user that results are fictional development records.
10. Mention when a product requires pharmacist review.
11. Mention when a product may cause drowsiness.
12. Mention when a product is unavailable or out of stock.
13. When no matching products are found, say so clearly.
14. Keep answers readable and practical.
15. Do not expose internal tool names, raw MongoDB queries, or internal implementation details in the final response.

When comparing products, use the search tool or exact-code tool as many times as necessary before answering.
`);

// This is the main AI node.
//
// It receives the current graph state,
// adds the system instructions,
// and asks the model what to do next.
async function runMedicationAssistantNode(state) {
  const messagesForModel = [
    practiceMedicationSystemMessage,
    ...state.messages,
  ];

  const modelResponse =
    await practiceMedicationModelWithTools.invoke(messagesForModel);

  return {
    messages: [modelResponse],
  };
}

// ToolNode automatically:
//
// 1. Reads tool calls from the latest AI message.
// 2. Finds the matching LangChain tool.
// 3. Executes the tool.
// 4. Adds the tool result back into graph state.
//
// Multiple requested tools can be executed in the same workflow.
const practiceMedicationToolNode = new ToolNode(practiceMedicationTools);

// Build the graph.
//
// MessagesAnnotation gives the graph a messages array
// and automatically appends new messages to the existing state.
const practiceMedicationGraph = new StateGraph(MessagesAnnotation)
  .addNode("medicationAssistant", runMedicationAssistantNode)
  .addNode("tools", practiceMedicationToolNode)

  // Every run begins at the medication assistant node.
  .addEdge(START, "medicationAssistant")

  // toolsCondition checks the most recent AI message.
  //
  // Tool calls exist:
  // medicationAssistant → tools
  //
  // No tool calls:
  // medicationAssistant → END
  .addConditionalEdges("medicationAssistant", toolsCondition, {
    tools: "tools",
    [END]: END,
  })

  // After tools finish, return their results to the model.
  //
  // The model can then:
  // - write the final response
  // - request another tool
  // - perform another search
  .addEdge("tools", "medicationAssistant");

// compile() turns the graph definition into an executable workflow.
export const practiceMedicationAgent = practiceMedicationGraph.compile();

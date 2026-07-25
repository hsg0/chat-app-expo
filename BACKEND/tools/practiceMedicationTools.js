// BACKEND/tools/practiceMedicationTools.js
//
// WHAT:
// Defines the safe MongoDB tools available to the medication practice agent.
//
// WHY:
// The language model must not directly access MongoDB.
// It may only call clearly defined tools with approved inputs.
//
// HOW:
// Each LangChain tool has:
// 1. A name.
// 2. A description explaining when the model should use it.
// 3. A JSON Schema describing its allowed inputs.
// 4. A function that safely queries the fictional medication collection.
//
// IMPORTANT:
// This file contains fictional product-search tools.
// It does not provide real medical advice.

import { tool } from "@langchain/core/tools";

import PracticeMedication from "../models/practiceMedication.js";

// Convert a MongoDB medication document into a smaller,
// predictable object for the AI model.
function prepareMedicationForAgent(medication) {
  return {
    medicationCode: medication.medicationCode,
    medicationName: medication.medicationName,
    brandName: medication.brandName,
    category: medication.category,
    description: medication.description,
    intendedUses: medication.intendedUses,
    activeIngredients: medication.activeIngredients,
    dosageForm: medication.dosageForm,
    ageGroup: medication.ageGroup,
    warnings: medication.warnings,
    tags: medication.tags,
    price: medication.price,
    currency: medication.currency,
    inventoryQuantity: medication.inventoryQuantity,
    requiresPharmacistReview: medication.requiresPharmacistReview,
    mayCauseDrowsiness: medication.mayCauseDrowsiness,
    isAvailableForSale: medication.isAvailableForSale,
    isFictionalPracticeData: medication.isFictionalPracticeData,
  };
}

// Make sure a possible string is safe to use.
function cleanOptionalString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

// Make sure the requested result limit remains between 1 and 10.
function createSafeLimit(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 5;
  }

  const wholeNumber = Math.floor(value);

  return Math.min(Math.max(wholeNumber, 1), 10);
}

// Make sure a possible price is a valid non-negative number.
function createSafeMaximumPrice(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return value;
}

export const searchPracticeMedicationsTool = tool(
  async (toolInput) => {
    const {
      searchQuery,
      category,
      maximumPrice,
      mayCauseDrowsiness,
      requiresPharmacistReview,
      availableOnly = true,
      limit = 5,
    } = toolInput || {};

    const cleanedSearchQuery = cleanOptionalString(searchQuery);
    const cleanedCategory = cleanOptionalString(category);
    const safeMaximumPrice = createSafeMaximumPrice(maximumPrice);
    const safeLimit = createSafeLimit(limit);

    const mongoFilter = {
      isFictionalPracticeData: true,
    };

    // Ordinary MongoDB text search.
    if (cleanedSearchQuery) {
      mongoFilter.$text = {
        $search: cleanedSearchQuery,
      };
    }

    // Case-insensitive category matching.
    if (cleanedCategory) {
      mongoFilter.category = {
        $regex: cleanedCategory,
        $options: "i",
      };
    }

    // Maximum price filter.
    if (typeof safeMaximumPrice === "number") {
      mongoFilter.price = {
        $lte: safeMaximumPrice,
      };
    }

    // Drowsiness filter.
    if (typeof mayCauseDrowsiness === "boolean") {
      mongoFilter.mayCauseDrowsiness = mayCauseDrowsiness;
    }

    // Pharmacist review filter.
    if (typeof requiresPharmacistReview === "boolean") {
      mongoFilter.requiresPharmacistReview = requiresPharmacistReview;
    }

    // Availability and inventory filters.
    if (availableOnly === true) {
      mongoFilter.isAvailableForSale = true;

      mongoFilter.inventoryQuantity = {
        $gt: 0,
      };
    }

    let medicationQuery = PracticeMedication.find(mongoFilter)
      .select("-embedding")
      .limit(safeLimit)
      .lean();

    // Sort text searches by MongoDB relevance score.
    if (mongoFilter.$text) {
      medicationQuery = medicationQuery
        .select({
          score: {
            $meta: "textScore",
          },
        })
        .sort({
          score: {
            $meta: "textScore",
          },
        });
    } else {
      // Sort non-text searches alphabetically.
      medicationQuery = medicationQuery.sort({
        medicationName: 1,
      });
    }

    const medications = await medicationQuery;

    return JSON.stringify({
      success: true,
      resultCount: medications.length,
      medications: medications.map(prepareMedicationForAgent),
    });
  },
  {
    name: "search_practice_medications",

    description:
      "Search the fictional medication catalogue. " +
      "Use this tool when the user asks to find products by symptoms, " +
      "intended use, category, price, drowsiness, availability, " +
      "or pharmacist-review requirements. " +
      "All returned products are fictional development records.",

    schema: {
      type: "object",

      properties: {
        searchQuery: {
          type: "string",
          description:
            "Words describing the requested symptom, intended use, product, or feature.",
        },

        category: {
          type: "string",
          description:
            "Optional category such as Allergy, Cold and Flu, Digestive Health, First Aid, or Skin Care.",
        },

        maximumPrice: {
          type: "number",
          minimum: 0,
          description: "Maximum product price in Canadian dollars.",
        },

        mayCauseDrowsiness: {
          type: "boolean",
          description:
            "Use true for drowsy products or false for non-drowsy products.",
        },

        requiresPharmacistReview: {
          type: "boolean",
          description:
            "Whether returned products must require pharmacist review.",
        },

        availableOnly: {
          type: "boolean",
          description:
            "When true, return only products available for sale with inventory.",
          default: true,
        },

        limit: {
          type: "integer",
          minimum: 1,
          maximum: 10,
          description: "Maximum number of products to return.",
          default: 5,
        },
      },

      additionalProperties: false,
    },
  }
);

export const getPracticeMedicationByCodeTool = tool(
  async (toolInput) => {
    const medicationCode = cleanOptionalString(
      toolInput?.medicationCode
    ).toUpperCase();

    if (!medicationCode) {
      return JSON.stringify({
        success: false,
        message: "A fictional medication code is required.",
      });
    }

    const medication = await PracticeMedication.findOne({
      medicationCode,
      isFictionalPracticeData: true,
    })
      .select("-embedding")
      .lean();

    if (!medication) {
      return JSON.stringify({
        success: false,
        message:
          "No fictional practice medication was found with that code.",
      });
    }

    return JSON.stringify({
      success: true,
      medication: prepareMedicationForAgent(medication),
    });
  },
  {
    name: "get_practice_medication_by_code",

    description:
      "Retrieve one fictional medication using its exact medication code, such as PRAC-0005.",

    schema: {
      type: "object",

      properties: {
        medicationCode: {
          type: "string",
          minLength: 1,
          description: "The exact fictional medication code.",
        },
      },

      required: ["medicationCode"],

      additionalProperties: false,
    },
  }
);

export const practiceMedicationTools = [
  searchPracticeMedicationsTool,
  getPracticeMedicationByCodeTool,
];

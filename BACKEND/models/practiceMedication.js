// BACKEND/models/practiceMedication.js
//
// WHAT:
// Defines the MongoDB structure for fictional practice medications.
//
// WHY:
// Gives us a safe dataset for learning:
// - MongoDB queries
// - text search
// - vector search
// - embeddings
// - AI tools
// - LangGraph
// - product filtering
//
// HOW:
// Each fictional medication is stored in the practiceMedications collection.
//
// IMPORTANT:
// This collection contains fictional development data only.
// It must never be presented as real medical or pharmaceutical information.

import mongoose from "mongoose";

const practiceMedicationSchema = new mongoose.Schema(
  {
    medicationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    medicationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    intendedUses: {
      type: [String],
      default: [],
    },

    activeIngredients: {
      type: [
        {
          ingredientName: {
            type: String,
            required: true,
            trim: true,
          },

          strength: {
            type: String,
            required: true,
            trim: true,
          },

          _id: false,
        },
      ],
      default: [],
    },

    dosageForm: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    ageGroup: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    directions: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    warnings: {
      type: [String],
      default: [],
    },

    contraindications: {
      type: [String],
      default: [],
    },

    possibleInteractions: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    currency: {
      type: String,
      default: "CAD",
      uppercase: true,
      trim: true,
      maxlength: 3,
    },

    inventoryQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    requiresPharmacistReview: {
      type: Boolean,
      default: false,
      index: true,
    },

    mayCauseDrowsiness: {
      type: Boolean,
      default: false,
      index: true,
    },

    isAvailableForSale: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFictionalPracticeData: {
      type: Boolean,
      default: true,
      immutable: true,
    },

    searchText: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "practiceMedications",
  }
);

// One MongoDB text index can contain several searchable fields.
practiceMedicationSchema.index({
  medicationName: "text",
  brandName: "text",
  category: "text",
  description: "text",
  intendedUses: "text",
  tags: "text",
  searchText: "text",
});

const PracticeMedication =
  mongoose.models.PracticeMedication ||
  mongoose.model(
    "PracticeMedication",
    practiceMedicationSchema
  );

export default PracticeMedication;
//
// WHAT:
// Stores normalized Canadian non-prescription drug products.
//
// WHY:
// Health Canada provides product information across several separate files.
// This model stores the combined information as one searchable OTC product.
//
// HOW:
// The import script joins Health Canada records using drugCode, then saves
// each finished OTC product in this collection.
//

import mongoose from "mongoose";

const activeIngredientSchema = new mongoose.Schema(
  {
    ingredientCode: {
      type: String,
      default: "",
    },

    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },

    strength: {
      type: String,
      default: "",
    },

    strengthUnit: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const packageSchema = new mongoose.Schema(
  {
    packageDescription: {
      type: String,
      default: "",
    },

    upc: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const healthCanadaOtcProductSchema = new mongoose.Schema(
  {
    drugCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    din: {
      type: String,
      required: true,
      index: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    productClass: {
      type: String,
      default: "Human",
    },

    schedule: {
      type: String,
      default: "NON-PRESCRIPTION DRUGS",
    },

    manufacturerName: {
      type: String,
      default: "",
      trim: true,
    },

    activeIngredients: {
      type: [activeIngredientSchema],
      default: [],
    },

    dosageForms: {
      type: [String],
      default: [],
    },

    routes: {
      type: [String],
      default: [],
    },

    packages: {
      type: [packageSchema],
      default: [],
    },

    atcCode: {
      type: String,
      default: "",
      index: true,
    },

    therapeuticName: {
      type: String,
      default: "",
      trim: true,
    },

    healthCanadaLastUpdateDate: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "Health Canada DPD",
    },

    isAvailableForSale: {
      type: Boolean,
      default: false,
    },

    retailPrice: {
      type: Number,
      default: null,
    },

    inventoryQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "healthCanadaOtcProducts",
  }
);

healthCanadaOtcProductSchema.index({
  brandName: "text",
  manufacturerName: "text",
  therapeuticName: "text",
  "activeIngredients.ingredientName": "text",
});

const HealthCanadaOtcProduct =
  mongoose.models.HealthCanadaOtcProduct ||
  mongoose.model("HealthCanadaOtcProduct", healthCanadaOtcProductSchema);

export default HealthCanadaOtcProduct;

// BACKEND/scripts/seedPracticeMedications.js
//
// WHAT:
// Creates and inserts 100 fictional medication records into MongoDB.
//
// WHY:
// Gives the practice chat assistant enough records for:
// - keyword search
// - filters
// - MongoDB text search
// - vector search
// - embeddings
// - LangGraph tools
// - product comparisons
//
// HOW:
// 1. Reuses the existing MongoDB connection.
// 2. Builds 100 fictional medication documents.
// 3. Deletes only previous practice medication records.
// 4. Inserts the new records into practiceMedications.
//
// IMPORTANT:
// This file never deletes the database.
// It only clears the practiceMedications collection.
//
// All products and ingredients are fictional.
// They must never be treated as real medication information.

import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../config/mongoDB.js";
import PracticeMedication from "../models/practiceMedication.js";

const medicationTemplates = [
  {
    brandName: "Calmora",
    baseName: "Head Relief",
    category: "Pain and Fever",
    description:
      "A fictional product for testing searches involving headache, minor aches, and temporary discomfort.",
    intendedUses: [
      "Mild headache",
      "Temporary body discomfort",
      "Minor muscle discomfort",
    ],
    ingredientName: "Fictaminophen",
    dosageForm: "Tablet",
    tags: ["headache", "pain", "body discomfort", "tablet", "non-drowsy"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "FeverEase",
    baseName: "Cooling Relief",
    category: "Pain and Fever",
    description:
      "A fictional product for testing searches involving fever-like symptoms, aches, and general discomfort.",
    intendedUses: [
      "Temporary fever-like symptoms",
      "Minor aches",
      "General discomfort",
    ],
    ingredientName: "Coolafen",
    dosageForm: "Coated tablet",
    tags: ["fever", "aches", "pain", "cooling", "tablet"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "BreatheBright",
    baseName: "Day Relief",
    category: "Cold and Flu",
    description:
      "A fictional daytime product for testing searches involving congestion, coughing, and cold-like symptoms.",
    intendedUses: ["Nasal congestion", "Dry cough", "Cold-like symptoms"],
    ingredientName: "Clearovent",
    dosageForm: "Capsule",
    tags: [
      "cold",
      "flu",
      "congestion",
      "cough",
      "daytime",
      "non-drowsy",
    ],
    requiresPharmacistReview: true,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "BreatheBright",
    baseName: "Night Relief",
    category: "Cold and Flu",
    description:
      "A fictional nighttime product for testing searches involving cough, congestion, and drowsiness warnings.",
    intendedUses: [
      "Nighttime cough",
      "Nasal congestion",
      "Cold-like symptoms",
    ],
    ingredientName: "Nightovent",
    dosageForm: "Liquid syrup",
    tags: ["cold", "flu", "cough", "congestion", "nighttime", "drowsy"],
    requiresPharmacistReview: true,
    mayCauseDrowsiness: true,
  },

  {
    brandName: "AllerClear",
    baseName: "Daytime Allergy",
    category: "Allergy",
    description:
      "A fictional non-drowsy allergy product for testing searches involving sneezing, watery eyes, and seasonal allergies.",
    intendedUses: [
      "Seasonal allergy symptoms",
      "Sneezing",
      "Watery eyes",
      "Runny nose",
    ],
    ingredientName: "Clarivex",
    dosageForm: "Tablet",
    tags: [
      "allergy",
      "seasonal allergies",
      "sneezing",
      "watery eyes",
      "runny nose",
      "non-drowsy",
    ],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "AllerRest",
    baseName: "Night Allergy",
    category: "Allergy",
    description:
      "A fictional nighttime allergy product for testing drowsiness warnings and product comparisons.",
    intendedUses: [
      "Seasonal allergy symptoms",
      "Sneezing",
      "Nighttime allergy discomfort",
    ],
    ingredientName: "Somnallergen",
    dosageForm: "Tablet",
    tags: ["allergy", "sneezing", "nighttime", "drowsy", "tablet"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: true,
  },

  {
    brandName: "TummyCalm",
    baseName: "Digestive Comfort",
    category: "Digestive Health",
    description:
      "A fictional product for testing searches involving indigestion, bloating, and temporary stomach discomfort.",
    intendedUses: [
      "Mild indigestion",
      "Temporary bloating",
      "Stomach discomfort",
    ],
    ingredientName: "Digestocalm",
    dosageForm: "Chewable tablet",
    tags: ["indigestion", "bloating", "stomach", "digestive", "chewable"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "AcidAway",
    baseName: "Acid Comfort",
    category: "Digestive Health",
    description:
      "A fictional product for testing searches involving heartburn-like symptoms and temporary acid discomfort.",
    intendedUses: [
      "Heartburn-like symptoms",
      "Acid discomfort",
      "Temporary indigestion",
    ],
    ingredientName: "Acidorel",
    dosageForm: "Soft chew",
    tags: ["heartburn", "acid", "indigestion", "digestive", "soft chew"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "MotionFree",
    baseName: "Travel Relief",
    category: "Nausea and Motion",
    description:
      "A fictional travel product for testing searches involving motion discomfort, nausea, and drowsiness.",
    intendedUses: [
      "Motion discomfort",
      "Travel nausea",
      "Temporary queasiness",
    ],
    ingredientName: "Movecalmine",
    dosageForm: "Tablet",
    tags: ["motion sickness", "travel", "nausea", "queasiness", "drowsy"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: true,
  },

  {
    brandName: "GingerWay",
    baseName: "Travel Drops",
    category: "Nausea and Motion",
    description:
      "A fictional non-drowsy product for testing searches involving mild travel discomfort and ginger-style products.",
    intendedUses: [
      "Mild travel discomfort",
      "Temporary queasiness",
      "Motion-related stomach discomfort",
    ],
    ingredientName: "Gingerex",
    dosageForm: "Lozenge",
    tags: [
      "motion sickness",
      "travel",
      "nausea",
      "ginger",
      "non-drowsy",
      "lozenge",
    ],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "SootheThroat",
    baseName: "Honey Comfort",
    category: "Cough and Sore Throat",
    description:
      "A fictional honey-flavoured product for testing searches involving dry throat and mild cough.",
    intendedUses: [
      "Dry throat",
      "Mild cough",
      "Temporary throat discomfort",
    ],
    ingredientName: "Soothenol",
    dosageForm: "Lozenge",
    tags: ["cough", "sore throat", "dry throat", "honey", "lozenge"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "CoughQuiet",
    baseName: "Day Syrup",
    category: "Cough and Sore Throat",
    description:
      "A fictional daytime product for testing cough-related searches and non-drowsy filtering.",
    intendedUses: [
      "Dry cough",
      "Temporary throat irritation",
      "Daytime cough discomfort",
    ],
    ingredientName: "Quietafen",
    dosageForm: "Liquid syrup",
    tags: ["cough", "dry cough", "daytime", "non-drowsy", "syrup"],
    requiresPharmacistReview: true,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "SleepNest",
    baseName: "Night Support",
    category: "Sleep Support",
    description:
      "A fictional sleep-support product for testing restricted categories and pharmacist-review workflows.",
    intendedUses: ["Temporary sleep difficulty", "Nighttime rest support"],
    ingredientName: "Restovene",
    dosageForm: "Tablet",
    tags: ["sleep", "nighttime", "rest", "drowsy", "pharmacist review"],
    requiresPharmacistReview: true,
    mayCauseDrowsiness: true,
  },

  {
    brandName: "NasalFlow",
    baseName: "Saline Mist",
    category: "Nasal Care",
    description:
      "A fictional nasal mist for testing searches involving dryness and nasal congestion.",
    intendedUses: [
      "Dry nasal passages",
      "Temporary nasal discomfort",
      "Mild congestion",
    ],
    ingredientName: "Practice Saline Blend",
    dosageForm: "Nasal spray",
    tags: [
      "nasal",
      "saline",
      "dry nose",
      "congestion",
      "spray",
      "non-drowsy",
    ],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "SkinCalm",
    baseName: "Anti-Itch Cream",
    category: "Skin Care",
    description:
      "A fictional topical product for testing searches involving itching and temporary skin irritation.",
    intendedUses: [
      "Minor itching",
      "Temporary skin irritation",
      "Dry skin discomfort",
    ],
    ingredientName: "Dermacalm",
    dosageForm: "Topical cream",
    tags: ["skin", "itch", "irritation", "cream", "topical"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "BurnBreeze",
    baseName: "Cooling Gel",
    category: "First Aid",
    description:
      "A fictional cooling product for testing searches involving minor burn-like discomfort and first-aid products.",
    intendedUses: [
      "Minor burn-like discomfort",
      "Temporary skin cooling",
      "First-aid practice scenarios",
    ],
    ingredientName: "Cooladerm",
    dosageForm: "Topical gel",
    tags: ["burn", "cooling", "first aid", "skin", "gel"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "EyeComfort",
    baseName: "Moisture Drops",
    category: "Eye Care",
    description:
      "A fictional eye-care product for testing searches involving dry and tired eyes.",
    intendedUses: [
      "Dry-eye-like discomfort",
      "Tired eyes",
      "Temporary eye dryness",
    ],
    ingredientName: "Moisturex",
    dosageForm: "Eye drops",
    tags: ["eye", "dry eyes", "tired eyes", "drops", "moisture"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "MuscleEase",
    baseName: "Warming Rub",
    category: "Muscle and Joint",
    description:
      "A fictional warming product for testing searches involving muscle soreness and joint discomfort.",
    intendedUses: [
      "Minor muscle soreness",
      "Temporary joint discomfort",
      "Post-exercise discomfort",
    ],
    ingredientName: "Thermoflex",
    dosageForm: "Topical rub",
    tags: ["muscle", "joint", "soreness", "exercise", "warming", "topical"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "HydraBoost",
    baseName: "Electrolyte Powder",
    category: "Hydration",
    description:
      "A fictional hydration product for testing searches involving exercise, travel, and electrolyte products.",
    intendedUses: [
      "Practice hydration support",
      "Exercise-related fluid replacement",
      "Travel hydration",
    ],
    ingredientName: "HydraSalt",
    dosageForm: "Powder packet",
    tags: ["hydration", "electrolytes", "exercise", "travel", "powder"],
    requiresPharmacistReview: false,
    mayCauseDrowsiness: false,
  },

  {
    brandName: "JuniorCalm",
    baseName: "Berry Liquid",
    category: "Children's Practice Products",
    description:
      "A fictional children's product for testing age restrictions and mandatory review workflows.",
    intendedUses: [
      "Testing child age filters",
      "Testing caregiver questions",
      "Testing pharmacist escalation",
    ],
    ingredientName: "Juniorcalm",
    dosageForm: "Liquid",
    tags: [
      "children",
      "pediatric",
      "liquid",
      "berry",
      "pharmacist review",
    ],
    requiresPharmacistReview: true,
    mayCauseDrowsiness: false,
  },
];

const productVariations = [
  {
    variationName: "Essential",
    strengthNumber: 10,
    priceAdjustment: 0,
  },
  {
    variationName: "Regular",
    strengthNumber: 20,
    priceAdjustment: 2,
  },
  {
    variationName: "Extra",
    strengthNumber: 30,
    priceAdjustment: 4,
  },
  {
    variationName: "Maximum",
    strengthNumber: 40,
    priceAdjustment: 6,
  },
  {
    variationName: "Advanced",
    strengthNumber: 50,
    priceAdjustment: 8,
  },
];

function createMedicationCode(number) {
  return `PRAC-${String(number).padStart(4, "0")}`;
}

function createPrice(templateIndex, variationIndex) {
  const basePrice = 7.99 + templateIndex * 0.65;
  const variationPrice = productVariations[variationIndex].priceAdjustment;

  return Number((basePrice + variationPrice).toFixed(2));
}

function createInventoryQuantity(productNumber) {
  return 15 + ((productNumber * 17) % 136);
}

function createAgeGroup(category) {
  if (category === "Children's Practice Products") {
    return "Children 6 to 11 years with mandatory review";
  }

  if (category === "Nasal Care" || category === "Cough and Sore Throat") {
    return "Adults and children 12 years and older";
  }

  return "Adults 18 years and older";
}

function createSearchText(medication) {
  const ingredientText = medication.activeIngredients
    .map(
      (ingredient) => `${ingredient.ingredientName} ${ingredient.strength}`
    )
    .join(" ");

  return [
    medication.medicationCode,
    medication.medicationName,
    medication.brandName,
    medication.category,
    medication.description,
    medication.dosageForm,
    medication.ageGroup,
    ingredientText,
    ...medication.intendedUses,
    ...medication.warnings,
    ...medication.contraindications,
    ...medication.possibleInteractions,
    ...medication.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildPracticeMedications() {
  const medications = [];
  let productNumber = 1;

  for (
    let templateIndex = 0;
    templateIndex < medicationTemplates.length;
    templateIndex += 1
  ) {
    const template = medicationTemplates[templateIndex];

    for (
      let variationIndex = 0;
      variationIndex < productVariations.length;
      variationIndex += 1
    ) {
      const variation = productVariations[variationIndex];

      const medication = {
        medicationCode: createMedicationCode(productNumber),

        medicationName: `${template.brandName} ${template.baseName} ${variation.variationName}`,

        brandName: template.brandName,

        category: template.category,

        description:
          `${template.description} ` +
          `This ${variation.variationName.toLowerCase()} variation is entirely fictional.`,

        intendedUses: template.intendedUses,

        activeIngredients: [
          {
            ingredientName: `${template.ingredientName} Practice Compound`,

            strength: `${variation.strengthNumber} PX fictional strength`,
          },
        ],

        dosageForm: template.dosageForm,

        ageGroup: createAgeGroup(template.category),

        directions:
          "Fictional development directions only. " +
          "Do not consume, apply, inhale, inject, or otherwise use this product.",

        warnings: [
          "This is a fictional practice product.",
          "Not approved for human or animal use.",
          "Do not use this information as medical guidance.",
          template.mayCauseDrowsiness
            ? "This record is marked as potentially drowsy for search testing."
            : "This record is marked as non-drowsy for search testing.",
        ],

        contraindications: [
          "Do not use outside this software-development exercise.",
          "Do not combine with real medications.",
        ],

        possibleInteractions: [
          "No real interaction information is provided.",
          "All interaction information in this record is fictional.",
        ],

        tags: [
          ...template.tags,
          variation.variationName.toLowerCase(),
          template.dosageForm.toLowerCase(),
          template.requiresPharmacistReview
            ? "pharmacist review required"
            : "general practice product",
        ],

        price: createPrice(templateIndex, variationIndex),

        currency: "CAD",

        inventoryQuantity: createInventoryQuantity(productNumber),

        requiresPharmacistReview: template.requiresPharmacistReview,

        mayCauseDrowsiness: template.mayCauseDrowsiness,

        isAvailableForSale: productNumber % 13 !== 0,

        isFictionalPracticeData: true,
      };

      medication.searchText = createSearchText(medication);

      medications.push(medication);

      productNumber += 1;
    }
  }

  return medications;
}

async function seedPracticeMedications() {
  try {
    console.log("Connecting through the existing MongoDB configuration...");

    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error(
        "MongoDB is not connected. Check MONGO_URI in BACKEND/.env."
      );
    }

    console.log("Ensuring practice medication indexes exist...");
    await PracticeMedication.syncIndexes();

    const practiceMedications = buildPracticeMedications();

    console.log(
      `Prepared ${practiceMedications.length} fictional medications.`
    );

    if (practiceMedications.length !== 100) {
      throw new Error(
        `Expected 100 medications but created ${practiceMedications.length}.`
      );
    }

    const deleteResult = await PracticeMedication.deleteMany({});

    console.log(
      `Removed ${deleteResult.deletedCount} previous practice medications.`
    );

    const insertedMedications = await PracticeMedication.insertMany(
      practiceMedications,
      {
        ordered: true,
      }
    );

    const finalDocumentCount = await PracticeMedication.countDocuments();

    console.log(
      `Inserted ${insertedMedications.length} practice medications.`
    );

    console.log(`Final collection count: ${finalDocumentCount}.`);

    console.log("Practice medication dataset seeded successfully.");
  } catch (error) {
    console.error("Failed to seed practice medications:");

    console.error(error);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  }
}

seedPracticeMedications();

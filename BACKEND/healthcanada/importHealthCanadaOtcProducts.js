//
// WHAT:
// Imports marketed Canadian non-prescription drugs into MongoDB.
//
// WHY:
// Health Canada splits drug information across several text files.
// This script joins those files using the shared drugCode value.
//
// HOW:
// 1. Connects using the backend's existing connectDB function.
// 2. Finds drug codes marked NON-PRESCRIPTION DRUGS.
// 3. Keeps matching Human products from drug.txt.
// 4. Attaches ingredients, forms, routes, packages, companies, and ATC data.
// 5. Upserts each completed OTC product into MongoDB.
//
// IMPORTANT:
// This file does not change the backend MongoDB configuration.
// It reuses the same database connection settings as the running backend.
//
// Run this file from the BACKEND folder.
//
// npm run import:health-canada-otc
//

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mongoose from "mongoose";
import { parse } from "csv-parse/sync";

import { connectDB } from "../config/mongoDB.js";
import HealthCanadaOtcProduct from "../models/healthCanadaOtcProductModel.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentFolderPath = path.dirname(currentFilePath);

const healthCanadaFilesFolder = path.join(currentFolderPath, "allfiles");

function readHealthCanadaFile(fileName) {
  const completeFilePath = path.join(healthCanadaFilesFolder, fileName);

  if (!fs.existsSync(completeFilePath)) {
    throw new Error(`Missing Health Canada file: ${completeFilePath}`);
  }

  const fileContents = fs.readFileSync(completeFilePath, "utf8");

  return parse(fileContents, {
    bom: true,
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
}

function addValueToArrayMap(map, drugCode, value) {
  if (!value) {
    return;
  }

  const existingValues = map.get(drugCode) || [];

  if (!existingValues.includes(value)) {
    existingValues.push(value);
  }

  map.set(drugCode, existingValues);
}

function addObjectToArrayMap(map, drugCode, value) {
  const existingValues = map.get(drugCode) || [];

  existingValues.push(value);

  map.set(drugCode, existingValues);
}

async function importHealthCanadaOtcProducts() {
  console.log(
    "Connecting using the existing backend MongoDB configuration..."
  );

  await connectDB();

  console.log("Reading Health Canada files...");

  const scheduleRows = readHealthCanadaFile("schedule.txt");
  const drugRows = readHealthCanadaFile("drug.txt");
  const ingredientRows = readHealthCanadaFile("ingred.txt");
  const formRows = readHealthCanadaFile("form.txt");
  const routeRows = readHealthCanadaFile("route.txt");
  const packageRows = readHealthCanadaFile("package.txt");
  const companyRows = readHealthCanadaFile("comp.txt");
  const therapeuticRows = readHealthCanadaFile("ther.txt");

  const otcDrugCodes = new Set();

  for (const scheduleRow of scheduleRows) {
    const drugCode = scheduleRow[0];
    const scheduleNameEnglish = scheduleRow[1];

    if (scheduleNameEnglish === "NON-PRESCRIPTION DRUGS") {
      otcDrugCodes.add(drugCode);
    }
  }

  console.log(`Found ${otcDrugCodes.size} non-prescription drug codes.`);

  const ingredientsByDrugCode = new Map();

  for (const ingredientRow of ingredientRows) {
    const drugCode = ingredientRow[0];

    if (!otcDrugCodes.has(drugCode)) {
      continue;
    }

    addObjectToArrayMap(ingredientsByDrugCode, drugCode, {
      ingredientCode: ingredientRow[1] || "",
      ingredientName: ingredientRow[2] || "",
      strength: ingredientRow[4] || "",
      strengthUnit: ingredientRow[5] || "",
    });
  }

  const dosageFormsByDrugCode = new Map();

  for (const formRow of formRows) {
    const drugCode = formRow[0];
    const dosageFormEnglish = formRow[2];

    if (!otcDrugCodes.has(drugCode)) {
      continue;
    }

    addValueToArrayMap(dosageFormsByDrugCode, drugCode, dosageFormEnglish);
  }

  const routesByDrugCode = new Map();

  for (const routeRow of routeRows) {
    const drugCode = routeRow[0];
    const routeEnglish = routeRow[2];

    if (!otcDrugCodes.has(drugCode)) {
      continue;
    }

    addValueToArrayMap(routesByDrugCode, drugCode, routeEnglish);
  }

  const packagesByDrugCode = new Map();

  for (const packageRow of packageRows) {
    const drugCode = packageRow[0];

    if (!otcDrugCodes.has(drugCode)) {
      continue;
    }

    const packageDescription = packageRow[5] || "";
    const upc = packageRow[6] || "";

    if (!packageDescription && !upc) {
      continue;
    }

    addObjectToArrayMap(packagesByDrugCode, drugCode, {
      packageDescription,
      upc,
    });
  }

  const manufacturerByDrugCode = new Map();

  for (const companyRow of companyRows) {
    const drugCode = companyRow[0];
    const companyName = companyRow[3] || "";
    const companyType = companyRow[4] || "";

    if (!otcDrugCodes.has(drugCode)) {
      continue;
    }

    if (companyType === "DIN_OWNER" || !manufacturerByDrugCode.has(drugCode)) {
      manufacturerByDrugCode.set(drugCode, companyName);
    }
  }

  const therapeuticDataByDrugCode = new Map();

  for (const therapeuticRow of therapeuticRows) {
    const drugCode = therapeuticRow[0];

    if (!otcDrugCodes.has(drugCode)) {
      continue;
    }

    therapeuticDataByDrugCode.set(drugCode, {
      atcCode: therapeuticRow[1] || "",
      therapeuticName: therapeuticRow[2] || "",
    });
  }

  const databaseOperations = [];

  for (const drugRow of drugRows) {
    const drugCode = drugRow[0];
    const productClass = drugRow[2];
    const din = drugRow[3];
    const brandName = drugRow[4];
    const lastUpdateDate = drugRow[9];

    if (!otcDrugCodes.has(drugCode)) {
      continue;
    }

    if (productClass !== "Human") {
      continue;
    }

    if (!din || !brandName) {
      continue;
    }

    const therapeuticData = therapeuticDataByDrugCode.get(drugCode) || {};

    databaseOperations.push({
      updateOne: {
        filter: {
          drugCode,
        },

        update: {
          $set: {
            drugCode,
            din,
            brandName,
            productClass,
            schedule: "NON-PRESCRIPTION DRUGS",

            manufacturerName: manufacturerByDrugCode.get(drugCode) || "",

            activeIngredients: ingredientsByDrugCode.get(drugCode) || [],

            dosageForms: dosageFormsByDrugCode.get(drugCode) || [],

            routes: routesByDrugCode.get(drugCode) || [],

            packages: packagesByDrugCode.get(drugCode) || [],

            atcCode: therapeuticData.atcCode || "",

            therapeuticName: therapeuticData.therapeuticName || "",

            healthCanadaLastUpdateDate: lastUpdateDate || "",

            source: "Health Canada DPD",
          },

          $setOnInsert: {
            isAvailableForSale: false,
            retailPrice: null,
            inventoryQuantity: 0,
          },
        },

        upsert: true,
      },
    });
  }

  console.log(`Prepared ${databaseOperations.length} Human OTC products.`);

  if (databaseOperations.length === 0) {
    console.log("No Human OTC products were found.");
    return;
  }

  const batchSize = 500;

  for (
    let startingIndex = 0;
    startingIndex < databaseOperations.length;
    startingIndex += batchSize
  ) {
    const currentBatch = databaseOperations.slice(
      startingIndex,
      startingIndex + batchSize
    );

    await HealthCanadaOtcProduct.bulkWrite(currentBatch, {
      ordered: false,
    });

    const importedCount = Math.min(
      startingIndex + batchSize,
      databaseOperations.length
    );

    console.log(
      `Saved ${importedCount} of ${databaseOperations.length} products.`
    );
  }

  const totalProducts = await HealthCanadaOtcProduct.countDocuments();

  console.log("--------------------------------");
  console.log("Health Canada OTC import completed.");
  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Products in collection: ${totalProducts}`);
  console.log("--------------------------------");
}

try {
  await importHealthCanadaOtcProducts();
} catch (error) {
  console.error("Health Canada OTC import failed:");
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

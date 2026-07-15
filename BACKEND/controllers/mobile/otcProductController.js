//
// WHAT:
// Returns Health Canada OTC products to the DrAsk mobile app.
//
// WHY:
// The mobile app should not connect directly to MongoDB.
// It requests searchable and paginated OTC products through this controller.
//
// HOW:
// - getOtcProducts returns a paginated product list.
// - searchOtcProducts searches brand names, ingredients, manufacturers,
//   therapeutic names, and DIN numbers.
// - getOtcProductByDin returns one complete product.
//

import HealthCanadaOtcProduct from "../../models/healthCanadaOtcProductModel.js";

export async function getOtcProducts(request, response) {
  try {
    const requestedPage = Number(request.query.page) || 1;
    const requestedLimit = Number(request.query.limit) || 20;

    const page = Math.max(requestedPage, 1);
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const numberOfProductsToSkip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      HealthCanadaOtcProduct.find({})
        .sort({ brandName: 1 })
        .skip(numberOfProductsToSkip)
        .limit(limit)
        .lean(),

      HealthCanadaOtcProduct.countDocuments({}),
    ]);

    return response.status(200).json({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.error("Get OTC products error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load OTC products.",
    });
  }
}

export async function searchOtcProducts(request, response) {
  try {
    const searchText = String(request.query.q || "").trim();

    if (!searchText) {
      return response.status(400).json({
        success: false,
        message: "Please provide a search term.",
      });
    }

    const requestedPage = Number(request.query.page) || 1;
    const requestedLimit = Number(request.query.limit) || 20;

    const page = Math.max(requestedPage, 1);
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const numberOfProductsToSkip = (page - 1) * limit;

    const safeSearchText = searchText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const searchPattern = new RegExp(safeSearchText, "i");

    const searchFilter = {
      $or: [
        { brandName: searchPattern },
        { din: searchPattern },
        { manufacturerName: searchPattern },
        { therapeuticName: searchPattern },
        {
          "activeIngredients.ingredientName": searchPattern,
        },
      ],
    };

    const [products, totalProducts] = await Promise.all([
      HealthCanadaOtcProduct.find(searchFilter)
        .sort({ brandName: 1 })
        .skip(numberOfProductsToSkip)
        .limit(limit)
        .lean(),

      HealthCanadaOtcProduct.countDocuments(searchFilter),
    ]);

    return response.status(200).json({
      success: true,
      searchText,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.error("Search OTC products error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to search OTC products.",
    });
  }
}

export async function getOtcProductByDin(request, response) {
  try {
    const din = String(request.params.din || "").trim();

    const product = await HealthCanadaOtcProduct.findOne({
      din,
    }).lean();

    if (!product) {
      return response.status(404).json({
        success: false,
        message: "OTC product not found.",
      });
    }

    return response.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get OTC product by DIN error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to load the OTC product.",
    });
  }
}

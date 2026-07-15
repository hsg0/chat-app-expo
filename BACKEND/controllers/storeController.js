import Store from "../models/store.js";

function parseNumber(value) {
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

function normalizeImages(rawImages) {
	if (!rawImages) {
		return [];
	}

	if (Array.isArray(rawImages)) {
		return rawImages
			.map((item) => String(item || "").trim())
			.filter(Boolean)
			.slice(0, 10);
	}

	return String(rawImages)
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
		.slice(0, 10);
}

function sortFromQuery(sort) {
	switch (String(sort || "").toLowerCase()) {
		case "price_asc":
			return { price: 1, createdAt: -1 };
		case "price_desc":
			return { price: -1, createdAt: -1 };
		case "oldest":
			return { createdAt: 1 };
		case "newest":
		default:
			return { createdAt: -1 };
	}
}

export async function createStoreItem(req, res) {
	try {
		const ownerId = req.user?.id;

		if (!ownerId) {
			return res.status(401).json({
				success: false,
				message: "Not authorized.",
			});
		}

		const cleanName = String(req.body?.name || "").trim();
		const cleanDescription = String(req.body?.description || "").trim();
		const cleanCategory = String(req.body?.category || "General").trim();
		const cleanCurrency = String(req.body?.currency || "USD").trim();
		const cleanPrice = parseNumber(req.body?.price);
		const cleanStock = parseNumber(req.body?.stock);
		const cleanImages = normalizeImages(req.body?.images);

		if (!cleanName) {
			return res.status(400).json({
				success: false,
				message: "Product name is required.",
			});
		}

		if (cleanPrice === null || cleanPrice < 0) {
			return res.status(400).json({
				success: false,
				message: "Price must be a valid non-negative number.",
			});
		}

		const item = await Store.create({
			ownerId,
			name: cleanName,
			description: cleanDescription,
			category: cleanCategory || "General",
			currency: cleanCurrency || "USD",
			price: cleanPrice,
			stock: cleanStock === null || cleanStock < 0 ? 0 : cleanStock,
			images: cleanImages,
			isActive: Boolean(req.body?.isActive ?? true),
		});

		return res.status(201).json({
			success: true,
			message: "Store item created successfully.",
			item,
		});
	} catch (error) {
		console.error("Create store item error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while creating the store item.",
		});
	}
}

export async function getStoreItems(req, res) {
	try {
		const page = Math.max(parseNumber(req.query?.page) || 1, 1);
		const limit = Math.min(Math.max(parseNumber(req.query?.limit) || 20, 1), 100);
		const skip = (page - 1) * limit;

		const q = String(req.query?.q || "").trim();
		const category = String(req.query?.category || "").trim();
		const ownerId = String(req.query?.ownerId || "").trim();
		const minPrice = parseNumber(req.query?.minPrice);
		const maxPrice = parseNumber(req.query?.maxPrice);

		const filters = {
			isActive: true,
		};

		if (q) {
			filters.$or = [
				{ name: { $regex: q, $options: "i" } },
				{ description: { $regex: q, $options: "i" } },
			];
		}

		if (category) {
			filters.category = category;
		}

		if (ownerId) {
			filters.ownerId = ownerId;
		}

		if (minPrice !== null || maxPrice !== null) {
			filters.price = {};

			if (minPrice !== null) {
				filters.price.$gte = minPrice;
			}

			if (maxPrice !== null) {
				filters.price.$lte = maxPrice;
			}
		}

		const [items, total] = await Promise.all([
			Store.find(filters).sort(sortFromQuery(req.query?.sort)).skip(skip).limit(limit),
			Store.countDocuments(filters),
		]);

		return res.status(200).json({
			success: true,
			message: "Store items loaded.",
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
			items,
		});
	} catch (error) {
		console.error("Get store items error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while loading store items.",
		});
	}
}

export async function getStoreItemById(req, res) {
	try {
		const id = String(req.params?.id || "").trim();

		if (!id) {
			return res.status(400).json({
				success: false,
				message: "Store item id is required.",
			});
		}

		const item = await Store.findById(id);

		if (!item) {
			return res.status(404).json({
				success: false,
				message: "Store item not found.",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Store item loaded.",
			item,
		});
	} catch (error) {
		console.error("Get store item by id error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while loading the store item.",
		});
	}
}

export async function getMyStoreItems(req, res) {
	try {
		const ownerId = req.user?.id;

		if (!ownerId) {
			return res.status(401).json({
				success: false,
				message: "Not authorized.",
			});
		}

		const items = await Store.find({ ownerId }).sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			message: "Your store items loaded.",
			items,
		});
	} catch (error) {
		console.error("Get my store items error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while loading your store items.",
		});
	}
}

export async function updateStoreItem(req, res) {
	try {
		const ownerId = req.user?.id;
		const id = String(req.params?.id || "").trim();

		if (!ownerId) {
			return res.status(401).json({
				success: false,
				message: "Not authorized.",
			});
		}

		if (!id) {
			return res.status(400).json({
				success: false,
				message: "Store item id is required.",
			});
		}

		const existingItem = await Store.findById(id);

		if (!existingItem) {
			return res.status(404).json({
				success: false,
				message: "Store item not found.",
			});
		}

		if (existingItem.ownerId !== ownerId) {
			return res.status(403).json({
				success: false,
				message: "You can only update your own store items.",
			});
		}

		const updates = {};

		if (req.body?.name !== undefined) {
			updates.name = String(req.body.name || "").trim();
		}

		if (req.body?.description !== undefined) {
			updates.description = String(req.body.description || "").trim();
		}

		if (req.body?.category !== undefined) {
			updates.category = String(req.body.category || "General").trim() || "General";
		}

		if (req.body?.currency !== undefined) {
			updates.currency = String(req.body.currency || "USD").trim() || "USD";
		}

		if (req.body?.images !== undefined) {
			updates.images = normalizeImages(req.body.images);
		}

		if (req.body?.isActive !== undefined) {
			updates.isActive = Boolean(req.body.isActive);
		}

		if (req.body?.price !== undefined) {
			const parsedPrice = parseNumber(req.body.price);

			if (parsedPrice === null || parsedPrice < 0) {
				return res.status(400).json({
					success: false,
					message: "Price must be a valid non-negative number.",
				});
			}

			updates.price = parsedPrice;
		}

		if (req.body?.stock !== undefined) {
			const parsedStock = parseNumber(req.body.stock);

			if (parsedStock === null || parsedStock < 0) {
				return res.status(400).json({
					success: false,
					message: "Stock must be a valid non-negative number.",
				});
			}

			updates.stock = parsedStock;
		}

		if (updates.name !== undefined && !updates.name) {
			return res.status(400).json({
				success: false,
				message: "Product name cannot be empty.",
			});
		}

		const item = await Store.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});

		return res.status(200).json({
			success: true,
			message: "Store item updated successfully.",
			item,
		});
	} catch (error) {
		console.error("Update store item error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while updating the store item.",
		});
	}
}

export async function deleteStoreItem(req, res) {
	try {
		const ownerId = req.user?.id;
		const id = String(req.params?.id || "").trim();

		if (!ownerId) {
			return res.status(401).json({
				success: false,
				message: "Not authorized.",
			});
		}

		if (!id) {
			return res.status(400).json({
				success: false,
				message: "Store item id is required.",
			});
		}

		const existingItem = await Store.findById(id);

		if (!existingItem) {
			return res.status(404).json({
				success: false,
				message: "Store item not found.",
			});
		}

		if (existingItem.ownerId !== ownerId) {
			return res.status(403).json({
				success: false,
				message: "You can only delete your own store items.",
			});
		}

		await Store.findByIdAndDelete(id);

		return res.status(200).json({
			success: true,
			message: "Store item deleted successfully.",
		});
	} catch (error) {
		console.error("Delete store item error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while deleting the store item.",
		});
	}
}

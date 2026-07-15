import crypto from "crypto";
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: () => crypto.randomUUID(),
		},

		ownerId: {
			type: String,
			required: true,
			index: true,
		},

		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 120,
		},

		description: {
			type: String,
			default: "",
			trim: true,
			maxlength: 1200,
		},

		price: {
			type: Number,
			required: true,
			min: 0,
		},

		currency: {
			type: String,
			default: "USD",
			uppercase: true,
			trim: true,
			maxlength: 8,
		},

		category: {
			type: String,
			default: "General",
			trim: true,
			maxlength: 80,
			index: true,
		},

		images: {
			type: [String],
			default: [],
		},

		stock: {
			type: Number,
			default: 0,
			min: 0,
		},

		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
	},
	{ timestamps: true }
);

storeSchema.index({ createdAt: -1 });

const Store = mongoose.model("Store", storeSchema);

export default Store;

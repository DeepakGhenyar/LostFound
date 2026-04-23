const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    type: {
      type: String,
      enum: ["Lost", "Found"],
      required: [true, "Type (Lost/Found) is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    contactInfo: {
      type: String,
      required: [true, "Contact info is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);

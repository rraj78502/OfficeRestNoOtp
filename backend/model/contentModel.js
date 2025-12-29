const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    page: {
      type: String,
      required: true,
      enum: [
        "home",
        "about",
        "events",
        "gallery",
        "contact",
        "login",
        "membership",
        "footer",
        "global",
      ],
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "html", "json"],
      default: "text",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
contentSchema.index({ page: 1, section: 1 });
contentSchema.index({ key: 1 });

module.exports = mongoose.model("Content", contentSchema);


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeeStructureSchema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Annual"],
      default: "Monthly",
    },
  },
  { timestamps: true }
);

// Ensure unique combination of class + subject
FeeStructureSchema.index({ className: 1, subject: 1 }, { unique: true });

const FeeStructure = mongoose.model("FeeStructure", FeeStructureSchema);

module.exports = { FeeStructure };

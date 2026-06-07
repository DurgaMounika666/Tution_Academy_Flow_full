/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IFeeStructure extends Document {
  className: string;
  subject: string;
  amount: number;
  frequency: "Monthly" | "Quarterly" | "Annual";
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema = new Schema<IFeeStructure>(
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

export const FeeStructure = mongoose.model<IFeeStructure>("FeeStructure", FeeStructureSchema);

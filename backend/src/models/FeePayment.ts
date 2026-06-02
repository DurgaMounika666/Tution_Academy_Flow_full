/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IFeePayment extends Document {
  feeId: string; // FP-501
  studentId: string;
  studentName: string;
  title: string;
  amount: number;
  status: "Paid" | "Pending";
  dueDate: Date;
  transactionId?: string;
  paidDate?: Date;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeePaymentSchema = new Schema<IFeePayment>(
  {
    feeId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      ref: "Student",
    },
    studentName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    transactionId: {
      type: String,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
  },
  { timestamps: true }
);

export const FeePayment = mongoose.model<IFeePayment>(
  "FeePayment",
  FeePaymentSchema
);

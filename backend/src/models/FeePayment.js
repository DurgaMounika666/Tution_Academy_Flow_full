/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeePaymentSchema = new Schema(
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
    approvalStatus: {
      type: String,
      enum: ["None", "PendingApproval", "Approved", "Rejected"],
      default: "None",
    },
  },
  { timestamps: true }
);

const FeePayment = mongoose.model("FeePayment", FeePaymentSchema);

module.exports = { FeePayment };

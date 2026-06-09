/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ParentRegistrationSchema = new Schema(
  {
    parentName: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    classGrade: {
      type: String,
      required: true,
    },
    classMode: {
      type: String,
      enum: ["Online", "Offline", "Online & Offline"],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    advanceFeeAmount: {
      type: Number,
      required: true,
      default: 150,
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    registrationStatus: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
    approvedBy: {
      type: String,
    },
    approvedDate: {
      type: Date,
    },
    selectedCourses: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const ParentRegistration = mongoose.model(
  "ParentRegistration",
  ParentRegistrationSchema
);

module.exports = { ParentRegistration };

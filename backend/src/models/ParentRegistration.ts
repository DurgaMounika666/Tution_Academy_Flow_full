/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IParentRegistration extends Document {
  parentName: string;
  studentName: string;
  classGrade: string;
  classMode: "Online" | "Offline" | "Online & Offline";
  location: string;
  phone: string;
  email: string;
  password?: string; // Hashed password
  advanceFeeAmount: number;
  transactionId: string;
  paymentStatus: "Pending" | "Paid" | "Failed";
  registrationStatus: "Pending Approval" | "Approved" | "Rejected";
  selectedCourses: string[];
  approvedBy?: string;
  approvedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ParentRegistrationSchema = new Schema<IParentRegistration>(
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

export const ParentRegistration = mongoose.model<IParentRegistration>(
  "ParentRegistration",
  ParentRegistrationSchema
);

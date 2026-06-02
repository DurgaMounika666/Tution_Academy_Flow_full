/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  assignmentId: string;
  tutorId: string;
  title: string;
  subject: string;
  dueDate: Date;
  description: string;
  submissionsPending: number;
  status: "Active" | "Completed" | "On Hold";
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    assignmentId: {
      type: String,
      required: true,
      unique: true,
    },
    tutorId: {
      type: String,
      required: true,
      ref: "Tutor",
    },
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    submissionsPending: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "On Hold"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);

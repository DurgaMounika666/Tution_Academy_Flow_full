/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  reviewId: string;
  type: "student_tutor" | "parent_tuition";
  studentId?: string;
  parentEmail?: string;
  tutorId?: string;
  tutorName?: string;
  rating: number;
  comment: string;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewId: { type: String, required: true, unique: true },
    type: { type: String, enum: ["student_tutor", "parent_tuition"], required: true },
    studentId: { type: String },
    parentEmail: { type: String },
    tutorId: { type: String },
    tutorName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    subject: { type: String },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>("Review", ReviewSchema);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema(
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

const Review = mongoose.model("Review", ReviewSchema);

module.exports = { Review };

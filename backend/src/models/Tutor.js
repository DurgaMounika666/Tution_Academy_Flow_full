/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const TutorSchema = new Schema(
  {
    tutorId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    qualification: {
      type: String,
    },
    experience: {
      type: String,
    },
    image: {
      type: String,
    },
    assignedStudentIds: [
      {
        type: String,
      },
    ],
    subjects: [
      {
        type: String,
      },
    ],
    pendingTasksCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Tutor = mongoose.model("Tutor", TutorSchema);

module.exports = { Tutor };

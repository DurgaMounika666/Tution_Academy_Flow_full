/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ITutor extends Document {
  tutorId: string; // T-201
  userId: mongoose.Types.ObjectId;
  name: string;
  specialty: string;
  email: string;
  image?: string;
  assignedStudentIds: string[];
  pendingTasksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TutorSchema = new Schema<ITutor>(
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
    image: {
      type: String,
    },
    assignedStudentIds: [
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

export const Tutor = mongoose.model<ITutor>("Tutor", TutorSchema);

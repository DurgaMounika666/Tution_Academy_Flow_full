/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ITimetable extends Document {
  scheduleId: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  grade: string;
  day: string;
  startTime: string;
  endTime: string;
  mode: "Online" | "Offline" | "Hybrid";
  room?: string;
  assignedStudentIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    scheduleId: {
      type: String,
      required: true,
      unique: true,
    },
    tutorId: {
      type: String,
      required: true,
    },
    tutorName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Offline",
    },
    room: {
      type: String,
    },
    assignedStudentIds: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Timetable = mongoose.model<ITimetable>("Timetable", TimetableSchema);

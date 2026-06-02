/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  studentId: string; // ST-101
  userId: mongoose.Types.ObjectId;
  name: string;
  grade: string;
  section: string;
  parentEmail: string;
  assignedTutorIds: string[];
  learningSubjects: string[];
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentId: {
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
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
    },
    parentEmail: {
      type: String,
      required: true,
    },
    assignedTutorIds: [
      {
        type: String,
      },
    ],
    learningSubjects: [
      {
        type: String,
      },
    ],
    attendanceRate: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>("Student", StudentSchema);

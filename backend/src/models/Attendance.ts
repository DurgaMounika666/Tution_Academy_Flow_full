/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  attendanceId: string;
  studentId: string;
  date: Date;
  status: "Present" | "Absent" | "Late";
  batchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    attendanceId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      ref: "Student",
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      required: true,
    },
    batchId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  AttendanceSchema
);

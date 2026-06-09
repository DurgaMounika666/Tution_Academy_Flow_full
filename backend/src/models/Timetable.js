/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const TimetableSchema = new Schema(
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

const Timetable = mongoose.model("Timetable", TimetableSchema);

module.exports = { Timetable };

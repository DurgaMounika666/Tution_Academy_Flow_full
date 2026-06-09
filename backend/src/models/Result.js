/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResultSchema = new Schema(
  {
    resultId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      ref: "Student",
    },
    term: {
      type: String,
      required: true,
    },
    gpa: {
      type: Number,
      required: true,
    },
    mathsScore: {
      type: Number,
    },
    physicsScore: {
      type: Number,
    },
    literatureScore: {
      type: Number,
    },
    compSciScore: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", ResultSchema);

module.exports = { Result };

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IResult extends Document {
  resultId: string;
  studentId: string;
  term: string;
  gpa: number;
  mathsScore: number;
  physicsScore: number;
  literatureScore: number;
  compSciScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema = new Schema<IResult>(
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

export const Result = mongoose.model<IResult>("Result", ResultSchema);

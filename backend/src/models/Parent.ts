/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IParent extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  childrenIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ParentSchema = new Schema<IParent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    childrenIds: [
      {
        type: String,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

export const Parent = mongoose.model<IParent>("Parent", ParentSchema);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IDemoBooking extends Document {
  fullName: string;
  email: string;
  whatsappNumber: string;
  course: string;
  preferredDate?: Date;
  location?: string;
  studentClass?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemoBookingSchema = new Schema<IDemoBooking>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    studentClass: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const DemoBooking = mongoose.model<IDemoBooking>("DemoBooking", DemoBookingSchema);

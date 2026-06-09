/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const DemoBookingSchema = new Schema(
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

const DemoBooking = mongoose.model("DemoBooking", DemoBookingSchema);

module.exports = { DemoBooking };

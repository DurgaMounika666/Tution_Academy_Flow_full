/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ParentSchema = new Schema(
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
    occupation: {
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

const Parent = mongoose.model("Parent", ParentSchema);

module.exports = { Parent };

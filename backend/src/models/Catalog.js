/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const CatalogSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["subjects_by_class", "standards", "locations", "class_types", "languages"],
    },
    key: { type: String, default: null },
    values: [{ type: String }],
  },
  { timestamps: true }
);

CatalogSchema.index({ type: 1, key: 1 }, { unique: true });

const Catalog = mongoose.model("Catalog", CatalogSchema);

module.exports = { Catalog };

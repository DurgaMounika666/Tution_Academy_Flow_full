/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ICatalog extends Document {
  type: "subjects_by_class" | "standards" | "locations" | "class_types" | "languages";
  key?: string; // e.g. "9th Class" for subjects_by_class
  values: string[];
}

const CatalogSchema = new Schema<ICatalog>(
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

export const Catalog = mongoose.model<ICatalog>("Catalog", CatalogSchema);

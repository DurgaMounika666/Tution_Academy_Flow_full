/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { Catalog } from "../models/Catalog";

export class CatalogController {
  // GET /api/catalog — returns all catalog data in a structured format
  static async getAll(req: Request, res: Response) {
    try {
      const docs = await Catalog.find().lean();

      const standards: string[] = [];
      const locations: string[] = [];
      const classTypes: string[] = [];
      const languages: string[] = [];
      const subjectsByClass: Record<string, string[]> = {};

      for (const doc of docs) {
        switch (doc.type) {
          case "standards":
            standards.push(...doc.values);
            break;
          case "locations":
            locations.push(...doc.values);
            break;
          case "class_types":
            classTypes.push(...doc.values);
            break;
          case "languages":
            languages.push(...doc.values);
            break;
          case "subjects_by_class":
            if (doc.key) subjectsByClass[doc.key] = doc.values;
            break;
        }
      }

      res.json({ standards, locations, classTypes, languages, subjectsByClass });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/catalog/subjects — upsert subjects for a class
  static async upsertSubjects(req: Request, res: Response) {
    try {
      const { className, subjects } = req.body;
      if (!className || !Array.isArray(subjects)) {
        return res.status(400).json({ error: "className and subjects[] are required" });
      }

      const doc = await Catalog.findOneAndUpdate(
        { type: "subjects_by_class", key: className },
        { values: subjects },
        { upsert: true, new: true }
      );
      res.json(doc);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /api/catalog/standards — replace the standards list
  static async upsertStandards(req: Request, res: Response) {
    try {
      const { standards } = req.body;
      if (!Array.isArray(standards)) {
        return res.status(400).json({ error: "standards[] is required" });
      }

      const doc = await Catalog.findOneAndUpdate(
        { type: "standards", key: null },
        { values: standards },
        { upsert: true, new: true }
      );
      res.json(doc);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /api/catalog/locations — replace the locations list
  static async upsertLocations(req: Request, res: Response) {
    try {
      const { locations } = req.body;
      if (!Array.isArray(locations)) {
        return res.status(400).json({ error: "locations[] is required" });
      }

      const doc = await Catalog.findOneAndUpdate(
        { type: "locations", key: null },
        { values: locations },
        { upsert: true, new: true }
      );
      res.json(doc);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { Parent } from "../models/Parent";
import { Student } from "../models/Student";

const router = Router();

// GET /api/parents - get all parents
router.get("/", async (req: Request, res: Response) => {
  try {
    const parents = await Parent.find();
    res.json(parents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/parents/by-email/:email - get parent by email with their children
router.get("/by-email/:email", async (req: Request, res: Response) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();
    const parent = await Parent.findOne({ email });
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }
    // Populate children
    const children = await Student.find({ parentEmail: email });
    res.json({ ...parent.toObject(), children });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/parents/:parentId - get parent by id
router.get("/:parentId", async (req: Request, res: Response) => {
  try {
    const parent = await Parent.findById(req.params.parentId);
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }
    const children = await Student.find({ parentEmail: parent.email });
    res.json({ ...parent.toObject(), children });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

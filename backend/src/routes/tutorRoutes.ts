/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { Tutor } from "../models/Tutor";
import { Student } from "../models/Student";

const router = Router();

// GET /api/tutors - get all tutors
router.get("/", async (req: Request, res: Response) => {
  try {
    const tutors = await Tutor.find();
    res.json(tutors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tutors/:tutorId - get single tutor with their students
router.get("/:tutorId", async (req: Request, res: Response) => {
  try {
    const tutor = await Tutor.findOne({ tutorId: req.params.tutorId });
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }
    // Populate assigned students
    const students = await Student.find({ studentId: { $in: tutor.assignedStudentIds } });
    res.json({ ...tutor.toObject(), students });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tutors/by-email/:email - get tutor by email
router.get("/by-email/:email", async (req: Request, res: Response) => {
  try {
    const tutor = await Tutor.findOne({ email: req.params.email.toLowerCase() });
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }
    res.json(tutor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

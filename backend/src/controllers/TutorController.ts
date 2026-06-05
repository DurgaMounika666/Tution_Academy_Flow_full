/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { TutorService } from "../services/TutorService";
import { Student } from "../models/Student";

export class TutorController {
  static async getAllTutors(req: Request, res: Response) {
    try {
      const tutors = await TutorService.getAllTutors();
      res.json(tutors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTutorById(req: Request, res: Response) {
    try {
      const tutor = await TutorService.getTutorById(req.params.tutorId);
      if (!tutor) {
        return res.status(404).json({ error: "Tutor not found" });
      }
      const students = await Student.find({ studentId: { $in: tutor.assignedStudentIds } });
      res.json({ ...tutor.toObject(), students });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTutorByEmail(req: Request, res: Response) {
    try {
      const email = decodeURIComponent(req.params.email).toLowerCase();
      const tutor = await TutorService.getTutorByEmail(email);
      if (!tutor) {
        return res.status(404).json({ error: "Tutor not found" });
      }
      res.json(tutor);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createTutor(req: Request, res: Response) {
    try {
      const { name, specialty, email, subjects, image, password } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
      }
      const tutor = await TutorService.createTutor({
        name,
        specialty: specialty || "General Educator",
        email,
        subjects,
        image,
        password,
      });
      res.status(201).json({ message: "Tutor created successfully", tutor });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateTutor(req: Request, res: Response) {
    try {
      const tutor = await TutorService.updateTutor(req.params.tutorId, req.body);
      if (!tutor) {
        return res.status(404).json({ error: "Tutor not found" });
      }
      res.json({ message: "Tutor updated successfully", tutor });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteTutor(req: Request, res: Response) {
    try {
      const tutor = await TutorService.deleteTutor(req.params.tutorId);
      if (!tutor) {
        return res.status(404).json({ error: "Tutor not found" });
      }
      res.json({ message: "Tutor deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

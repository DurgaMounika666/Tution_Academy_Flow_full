/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { StudentService } from "../services/StudentService";

export class StudentController {
  static async getStudentById(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const student = await StudentService.getStudentById(studentId);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json(student);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentsByParent(req: AuthenticatedRequest, res: Response) {
    try {
      const { parentEmail } = req.params;
      const students = await StudentService.getStudentsByParent(parentEmail);

      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        studentId,
        userId,
        name,
        grade,
        section,
        parentEmail,
      } = req.body;

      const student = await StudentService.createStudent(
        studentId,
        userId,
        name,
        grade,
        parentEmail,
        section
      );

      res.status(201).json({
        message: "Student created successfully",
        student,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const updateData = req.body;

      const student = await StudentService.updateStudent(studentId, updateData);

      res.json({
        message: "Student updated successfully",
        student,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async assignTutor(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const { tutorId } = req.body;

      const student = await StudentService.assignTutor(studentId, tutorId);

      res.json({
        message: "Tutor assigned successfully",
        student,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async addLearningSubjects(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const { subjects } = req.body;

      const student = await StudentService.addLearningSubjects(
        studentId,
        subjects
      );

      res.json({
        message: "Learning subjects updated successfully",
        student,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

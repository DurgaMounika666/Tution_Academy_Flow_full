/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { StudentService } from "../services/StudentService";

export class StudentController {
  static async getAllStudents(req: AuthenticatedRequest, res: Response) {
    try {
      const students = await StudentService.getAllStudents();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

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
      const students = await StudentService.getStudentsByParent(
        decodeURIComponent(parentEmail)
      );

      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentsByTutor(req: AuthenticatedRequest, res: Response) {
    try {
      const { tutorId } = req.params;
      const students = await StudentService.getStudentsByTutor(tutorId);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, grade, section, parentEmail, assignedTutorIds, learningSubjects, phone } = req.body;

      if (!name || !grade || !parentEmail) {
        return res.status(400).json({ error: "name, grade, and parentEmail are required" });
      }

      const student = await StudentService.createStudent({
        name,
        grade,
        section,
        parentEmail,
        assignedTutorIds,
        learningSubjects,
        phone,
      });

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
      const student = await StudentService.updateStudent(studentId, req.body);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({
        message: "Student updated successfully",
        student,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const student = await StudentService.deleteStudent(studentId);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
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

      const student = await StudentService.addLearningSubjects(studentId, subjects);

      res.json({
        message: "Learning subjects updated successfully",
        student,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

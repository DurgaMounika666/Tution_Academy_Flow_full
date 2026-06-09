/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { StudentService } = require("../services/StudentService");

class StudentController {
  static async getAllStudents(req, res) {
    try {
      const students = await StudentService.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentById(req, res) {
    try {
      const { studentId } = req.params;
      const student = await StudentService.getStudentById(studentId);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentsByParent(req, res) {
    try {
      const { parentEmail } = req.params;
      const students = await StudentService.getStudentsByParent(
        decodeURIComponent(parentEmail)
      );

      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentsByTutor(req, res) {
    try {
      const { tutorId } = req.params;
      const students = await StudentService.getStudentsByTutor(tutorId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createStudent(req, res) {
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateStudent(req, res) {
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteStudent(req, res) {
    try {
      const { studentId } = req.params;
      const student = await StudentService.deleteStudent(studentId);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async assignTutor(req, res) {
    try {
      const { studentId } = req.params;
      const { tutorId } = req.body;

      const student = await StudentService.assignTutor(studentId, tutorId);

      res.json({
        message: "Tutor assigned successfully",
        student,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async addLearningSubjects(req, res) {
    try {
      const { studentId } = req.params;
      const { subjects } = req.body;

      const student = await StudentService.addLearningSubjects(studentId, subjects);

      res.json({
        message: "Learning subjects updated successfully",
        student,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = { StudentController };

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from "../models/Student";

export class StudentService {
  static async getStudentById(studentId: string) {
    return Student.findOne({ studentId });
  }

  static async getStudentsByParent(parentEmail: string) {
    return Student.find({ parentEmail });
  }

  static async createStudent(
    studentId: string,
    userId: string,
    name: string,
    grade: string,
    parentEmail: string,
    section?: string
  ) {
    const student = new Student({
      studentId,
      userId,
      name,
      grade,
      section,
      parentEmail,
    });

    return student.save();
  }

  static async updateStudent(studentId: string, updateData: any) {
    return Student.findOneAndUpdate(
      { studentId },
      updateData,
      { new: true }
    );
  }

  static async assignTutor(studentId: string, tutorId: string) {
    const student = await Student.findOne({ studentId });
    if (student && !student.assignedTutorIds.includes(tutorId)) {
      student.assignedTutorIds.push(tutorId);
      return student.save();
    }
    return student;
  }

  static async addLearningSubjects(
    studentId: string,
    subjects: string[]
  ) {
    return Student.findOneAndUpdate(
      { studentId },
      { learningSubjects: subjects },
      { new: true }
    );
  }

  static async updateAttendance(
    studentId: string,
    presentCount: number,
    absentCount: number
  ) {
    const total = presentCount + absentCount;
    const attendanceRate = total > 0 ? (presentCount / total) * 100 : 0;

    return Student.findOneAndUpdate(
      { studentId },
      {
        presentCount,
        absentCount,
        attendanceRate: Math.round(attendanceRate),
      },
      { new: true }
    );
  }
}

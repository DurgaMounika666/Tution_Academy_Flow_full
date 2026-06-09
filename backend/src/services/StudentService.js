/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Student } = require("../models/Student");
const { User } = require("../models/User");
const { Parent } = require("../models/Parent");
const { Tutor } = require("../models/Tutor");
const { AuthService } = require("./AuthService");
const { ParentService } = require("./ParentService");

class StudentService {
  static async getAllStudents() {
    return Student.find().sort({ createdAt: -1 });
  }

  static async getStudentById(studentId) {
    return Student.findOne({ studentId });
  }

  static async getStudentsByParent(parentEmail) {
    return Student.find({ parentEmail: parentEmail.toLowerCase() });
  }

  static async getStudentsByTutor(tutorId) {
    return Student.find({ assignedTutorIds: tutorId });
  }

  static async generateStudentId() {
    const count = await Student.countDocuments();
    return `ST-${100 + count + 1}`;
  }

  static async createStudent(data) {
    const studentId = data.studentId || (await this.generateStudentId());
    const existing = await Student.findOne({ studentId });
    if (existing) {
      throw new Error(`Student ID ${studentId} already exists`);
    }

    const parentEmail = data.parentEmail.toLowerCase();
    let studentEmail = `${data.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.academyflow.com`;
    const existingUser = await User.findOne({ email: studentEmail });
    if (existingUser) {
      studentEmail = `${data.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.${Date.now().toString().slice(-4)}@student.academyflow.com`;
    }

    const hashedPassword = await AuthService.hashPassword("password");
    const studentUser = new User({
      email: studentEmail,
      password: hashedPassword,
      role: "student",
    });
    await studentUser.save();

    const parent = await Parent.findOne({ email: parentEmail });

    const student = new Student({
      studentId,
      userId: studentUser._id,
      name: data.name,
      grade: data.grade,
      section: data.section || "Section A",
      parentEmail,
      parentId: parent?._id,
      assignedTutorIds: data.assignedTutorIds || [],
      learningSubjects: data.learningSubjects || ["Mathematics"],
      phone: data.phone || "",
      attendanceRate: 100,
      presentCount: 0,
      absentCount: 0,
    });

    await student.save();

    if (parent) {
      await ParentService.addChildToParent(parentEmail, studentId);
    }

    return student;
  }

  static async updateStudent(studentId, updateData) {
    const allowed = [
      "name", "grade", "section", "parentEmail", "assignedTutorIds",
      "learningSubjects", "phone", "dateOfBirth", "address",
      "attendanceRate", "presentCount", "absentCount",
    ];
    const filtered = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) filtered[key] = updateData[key];
    }
    return Student.findOneAndUpdate({ studentId }, filtered, { new: true });
  }

  static async deleteStudent(studentId) {
    const student = await Student.findOne({ studentId });
    if (!student) return null;

    await User.deleteOne({ _id: student.userId });
    await Student.deleteOne({ studentId });

    await Parent.updateMany(
      { childrenIds: studentId },
      { $pull: { childrenIds: studentId } }
    );
    await Tutor.updateMany(
      { assignedStudentIds: studentId },
      { $pull: { assignedStudentIds: studentId } }
    );

    return student;
  }

  static async assignTutor(studentId, tutorId) {
    const student = await Student.findOne({ studentId });
    if (!student) throw new Error("Student not found");

    if (!student.assignedTutorIds.includes(tutorId)) {
      student.assignedTutorIds.push(tutorId);
      await student.save();
    }

    const tutor = await Tutor.findOne({ tutorId });
    if (tutor && !tutor.assignedStudentIds.includes(studentId)) {
      tutor.assignedStudentIds.push(studentId);
      await tutor.save();
    }

    return student;
  }

  static async addLearningSubjects(studentId, subjects) {
    return Student.findOneAndUpdate(
      { studentId },
      { learningSubjects: subjects },
      { new: true }
    );
  }

  static async updateAttendance(
    studentId,
    presentCount,
    absentCount
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

module.exports = { StudentService };

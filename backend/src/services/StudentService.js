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

    let assignedTutorIds = data.assignedTutorIds || [];
    const learningSubjects = data.learningSubjects || ["Mathematics"];

    if (assignedTutorIds.length === 0 && learningSubjects.length > 0) {
      const allTutors = await Tutor.find({});
      const matchSubject = (subjectName, tutorSubject) => {
        const s1 = subjectName.toLowerCase();
        const s2 = tutorSubject.toLowerCase();
        if (s1 === s2) return true;
        if (s1.includes(s2) || s2.includes(s1)) return true;
        const words1 = s1.split(/[\s/()]+/).filter(w => w.length > 3);
        const words2 = s2.split(/[\s/()]+/).filter(w => w.length > 3);
        for (const w1 of words1) {
          if (words2.includes(w1)) return true;
        }
        return false;
      };
      for (const tutor of allTutors) {
        const teachesSelected = tutor.subjects?.some(sub => 
          learningSubjects.some(course => matchSubject(course, sub))
        );
        if (teachesSelected) {
          assignedTutorIds.push(tutor.tutorId);
        }
      }
    }

    const student = new Student({
      studentId,
      userId: studentUser._id,
      name: data.name,
      grade: data.grade,
      section: data.section || "Section A",
      parentEmail,
      parentId: parent?._id,
      assignedTutorIds,
      learningSubjects,
      phone: data.phone || "",
      attendanceRate: 100,
      presentCount: 0,
      absentCount: 0,
    });

    await student.save();

    if (assignedTutorIds.length > 0) {
      await Tutor.updateMany(
        { tutorId: { $in: assignedTutorIds } },
        { $addToSet: { assignedStudentIds: studentId } }
      );
    }

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

    const oldStudent = await Student.findOne({ studentId });
    const updatedStudent = await Student.findOneAndUpdate({ studentId }, filtered, { new: true });

    if (updateData.assignedTutorIds !== undefined && oldStudent) {
      const oldTutors = oldStudent.assignedTutorIds || [];
      const newTutors = updateData.assignedTutorIds || [];

      const removedTutors = oldTutors.filter(tId => !newTutors.includes(tId));
      const addedTutors = newTutors.filter(tId => !oldTutors.includes(tId));

      if (removedTutors.length > 0) {
        await Tutor.updateMany(
          { tutorId: { $in: removedTutors } },
          { $pull: { assignedStudentIds: studentId } }
        );
      }
      if (addedTutors.length > 0) {
        await Tutor.updateMany(
          { tutorId: { $in: addedTutors } },
          { $addToSet: { assignedStudentIds: studentId } }
        );
      }
    }

    return updatedStudent;
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

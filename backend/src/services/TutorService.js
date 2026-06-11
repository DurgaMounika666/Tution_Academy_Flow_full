/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Tutor } = require("../models/Tutor");
const { User } = require("../models/User");
const { Student } = require("../models/Student");
const { AuthService } = require("./AuthService");

class TutorService {
  static async getTutorById(tutorId) {
    return Tutor.findOne({ tutorId });
  }

  static async getTutorByEmail(email) {
    return Tutor.findOne({ email: email.toLowerCase() });
  }

  static async getAllTutors() {
    return Tutor.find().sort({ createdAt: -1 });
  }

  static async generateTutorId() {
    const count = await Tutor.countDocuments();
    return `T-${200 + count + 1}`;
  }

  static async createTutor(data) {
    const email = data.email.toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const tutorId = await this.generateTutorId();
    const hashedPassword = await AuthService.hashPassword(data.password || "password");

    const user = new User({
      email,
      password: hashedPassword,
      role: "tutor",
    });
    await user.save();

    const tutor = new Tutor({
      tutorId,
      userId: user._id,
      name: data.name,
      specialty: data.specialty,
      email,
      subjects: data.subjects || [],
      image: data.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      assignedStudentIds: [],
      pendingTasksCount: 0,
    });

    return tutor.save();
  }

  static async updateTutor(tutorId, updateData) {
    const allowed = [
      "name", "specialty", "email", "phone", "qualification",
      "experience", "image", "subjects", "assignedStudentIds", "pendingTasksCount",
    ];
    const filtered = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) filtered[key] = updateData[key];
    }

    const tutor = await Tutor.findOne({ tutorId });
    if (tutor && updateData.email) {
      const newEmail = updateData.email.toLowerCase().trim();
      filtered.email = newEmail;
      await User.findByIdAndUpdate(tutor.userId, { email: newEmail });
    }

    return Tutor.findOneAndUpdate({ tutorId }, filtered, { new: true });
  }

  static async deleteTutor(tutorId) {
    const tutor = await Tutor.findOne({ tutorId });
    if (!tutor) return null;

    await User.deleteOne({ _id: tutor.userId });
    await Tutor.deleteOne({ tutorId });

    await Student.updateMany(
      { assignedTutorIds: tutorId },
      { $pull: { assignedTutorIds: tutorId } }
    );

    return tutor;
  }

  static async assignStudent(tutorId, studentId) {
    const tutor = await Tutor.findOne({ tutorId });
    if (tutor && !tutor.assignedStudentIds.includes(studentId)) {
      tutor.assignedStudentIds.push(studentId);
      return tutor.save();
    }
    return tutor;
  }

  static async getAssignedStudents(tutorId) {
    const tutor = await Tutor.findOne({ tutorId });
    return tutor?.assignedStudentIds || [];
  }

  static async updatePendingTasks(tutorId, count) {
    return Tutor.findOneAndUpdate(
      { tutorId },
      { pendingTasksCount: count },
      { new: true }
    );
  }
}

module.exports = { TutorService };

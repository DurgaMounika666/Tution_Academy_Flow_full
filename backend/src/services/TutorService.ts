/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tutor } from "../models/Tutor";

export class TutorService {
  static async getTutorById(tutorId: string) {
    return Tutor.findOne({ tutorId });
  }

  static async getTutorByEmail(email: string) {
    return Tutor.findOne({ email });
  }

  static async getAllTutors() {
    return Tutor.find();
  }

  static async createTutor(
    tutorId: string,
    userId: string,
    name: string,
    specialty: string,
    email: string,
    image?: string
  ) {
    const tutor = new Tutor({
      tutorId,
      userId,
      name,
      specialty,
      email,
      image,
    });

    return tutor.save();
  }

  static async assignStudent(tutorId: string, studentId: string) {
    const tutor = await Tutor.findOne({ tutorId });
    if (tutor && !tutor.assignedStudentIds.includes(studentId)) {
      tutor.assignedStudentIds.push(studentId);
      return tutor.save();
    }
    return tutor;
  }

  static async getAssignedStudents(tutorId: string) {
    const tutor = await Tutor.findOne({ tutorId });
    return tutor?.assignedStudentIds || [];
  }

  static async updatePendingTasks(tutorId: string, count: number) {
    return Tutor.findOneAndUpdate(
      { tutorId },
      { pendingTasksCount: count },
      { new: true }
    );
  }
}

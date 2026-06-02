/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assignment } from "../models/Assignment";

export class AssignmentService {
  static async createAssignment(
    assignmentId: string,
    tutorId: string,
    title: string,
    subject: string,
    dueDate: Date,
    description?: string
  ) {
    const assignment = new Assignment({
      assignmentId,
      tutorId,
      title,
      subject,
      dueDate,
      description,
      status: "Active",
    });

    return assignment.save();
  }

  static async getAssignmentsByTutor(tutorId: string) {
    return Assignment.find({ tutorId });
  }

  static async getAssignmentById(assignmentId: string) {
    return Assignment.findOne({ assignmentId });
  }

  static async updateAssignmentStatus(
    assignmentId: string,
    status: "Active" | "Completed" | "On Hold"
  ) {
    return Assignment.findOneAndUpdate(
      { assignmentId },
      { status },
      { new: true }
    );
  }

  static async getActiveAssignments() {
    return Assignment.find({ status: "Active" });
  }
}

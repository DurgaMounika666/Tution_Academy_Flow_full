/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Assignment } = require("../models/Assignment");

class AssignmentService {
  static async createAssignment(
    assignmentId,
    tutorId,
    title,
    subject,
    dueDate,
    description
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

  static async getAssignmentsByTutor(tutorId) {
    return Assignment.find({ tutorId });
  }

  static async getAssignmentById(assignmentId) {
    return Assignment.findOne({ assignmentId });
  }

  static async updateAssignmentStatus(
    assignmentId,
    status
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

module.exports = { AssignmentService };

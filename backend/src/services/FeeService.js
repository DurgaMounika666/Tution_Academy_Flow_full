/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { FeePayment } = require("../models/FeePayment");
const { Student } = require("../models/Student");

class FeeService {
  /**
   * Generates the next unique feeId by finding the highest existing
   * feeId number in the database and incrementing it.
   * This is safe even when documents are deleted or IDs are non-sequential.
   */
  static async generateFeeId() {
    const latest = await FeePayment.findOne({ feeId: /^FP-\d+$/ })
      .sort({ feeId: -1 })
      .select("feeId")
      .lean();

    if (!latest) {
      return "FP-501";
    }

    // Extract the numeric part from e.g. "FP-517" → 517
    const currentNum = parseInt(latest.feeId.replace("FP-", ""), 10);
    return `FP-${currentNum + 1}`;
  }

  static async createFee(
    studentId,
    title,
    amount,
    dueDate,
    feeId,
    studentName
  ) {
    let resolvedStudentName = studentName;

    if (!resolvedStudentName) {
      if (!studentId) {
        throw new Error("Cannot resolve student name: studentId is missing");
      }
      const student = await Student.findOne({ studentId });
      if (!student) {
        throw new Error(`Student ${studentId} not found`);
      }
      resolvedStudentName = student.name;
    }

    // Retry loop: handles rare race conditions where two requests
    // generate the same ID at the same moment
    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const resolvedFeeId = feeId || (await this.generateFeeId());

      try {
        const fee = new FeePayment({
          feeId: resolvedFeeId,
          studentId,
          studentName: resolvedStudentName,
          title,
          amount,
          dueDate,
          status: "Pending",
        });

        return await fee.save();
      } catch (err) {
        // E11000 = MongoDB duplicate key error code
        const isDuplicate = err.code === 11000 || (err.message && err.message.includes("E11000"));

        // If a custom feeId was provided by the caller and it's a duplicate,
        // don't retry — propagate the error immediately
        if (isDuplicate && feeId) {
          throw new Error(`Fee ID "${feeId}" already exists.`);
        }

        // If auto-generated and duplicate, retry with a fresh generated ID
        if (isDuplicate && attempt < MAX_RETRIES - 1) {
          // Force regenerate on next loop (ignore passed feeId param for retries)
          feeId = null;
          continue;
        }

        throw err;
      }
    }
  }

  static async getAllFees() {
    return FeePayment.find().sort({ createdAt: -1 });
  }

  static async getFeesByStudent(studentId) {
    return FeePayment.find({ studentId });
  }

  static async getFeeById(feeId) {
    return FeePayment.findOne({ feeId });
  }

  static async updateFeePayment(
    feeId,
    transactionId,
    paymentMethod
  ) {
    return FeePayment.findOneAndUpdate(
      { feeId },
      {
        status: "Paid",
        transactionId,
        paymentMethod,
        paidDate: new Date(),
      },
      { new: true }
    );
  }

  static async getPendingApprovals() {
    return FeePayment.find({ approvalStatus: "PendingApproval" }).sort({ createdAt: -1 });
  }

  static async updateApprovalStatus(feeId, status) {
    return FeePayment.findOneAndUpdate(
      { feeId },
      { approvalStatus: status },
      { new: true }
    );
  }

  static async getPendingFees(studentId) {
    const query = studentId
      ? { studentId, status: "Pending" }
      : { status: "Pending" };
    return FeePayment.find(query);
  }

  static async generateFeeReport(month, year) {
    const query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const fees = await FeePayment.find(query);
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paid = fees.filter((f) => f.status === "Paid").reduce((sum, fee) => sum + fee.amount, 0);
    const pending = fees.filter((f) => f.status === "Pending").reduce((sum, fee) => sum + fee.amount, 0);

    return { total, paid, pending, feeCount: fees.length };
  }
}

module.exports = { FeeService };

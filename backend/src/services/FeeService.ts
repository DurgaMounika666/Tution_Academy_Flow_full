/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeePayment } from "../models/FeePayment";
import { Student } from "../models/Student";

export class FeeService {
  static async generateFeeId() {
    const count = await FeePayment.countDocuments();
    return `FP-${500 + count + 1}`;
  }

  static async createFee(
    studentId: string,
    title: string,
    amount: number,
    dueDate: Date,
    feeId?: string,
    studentName?: string
  ) {
    const resolvedFeeId = feeId || (await this.generateFeeId());
    let resolvedStudentName = studentName;

    if (!resolvedStudentName) {
      const student = await Student.findOne({ studentId });
      if (!student) {
        throw new Error(`Student ${studentId} not found`);
      }
      resolvedStudentName = student.name;
    }

    const fee = new FeePayment({
      feeId: resolvedFeeId,
      studentId,
      studentName: resolvedStudentName,
      title,
      amount,
      dueDate,
      status: "Pending",
    });

    return fee.save();
  }

  static async getAllFees() {
    return FeePayment.find().sort({ createdAt: -1 });
  }

  static async getFeesByStudent(studentId: string) {
    return FeePayment.find({ studentId });
  }

  static async getFeeById(feeId: string) {
    return FeePayment.findOne({ feeId });
  }

  static async updateFeePayment(
    feeId: string,
    transactionId: string,
    paymentMethod: string
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

  static async updateApprovalStatus(feeId: string, status: "Approved" | "Rejected") {
    return FeePayment.findOneAndUpdate(
      { feeId },
      { approvalStatus: status },
      { new: true }
    );
  }

  static async getPendingFees(studentId?: string) {
    const query = studentId
      ? { studentId, status: "Pending" }
      : { status: "Pending" };
    return FeePayment.find(query);
  }

  static async generateFeeReport(month?: number, year?: number) {
    const query: Record<string, unknown> = {};
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

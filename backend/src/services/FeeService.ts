/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeePayment } from "../models/FeePayment";

export class FeeService {
  static async createFee(
    feeId: string,
    studentId: string,
    studentName: string,
    title: string,
    amount: number,
    dueDate: Date
  ) {
    const fee = new FeePayment({
      feeId,
      studentId,
      studentName,
      title,
      amount,
      dueDate,
      status: "Pending",
    });

    return fee.save();
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

  static async getPendingFees(studentId?: string) {
    const query = studentId
      ? { studentId, status: "Pending" }
      : { status: "Pending" };
    return FeePayment.find(query);
  }

  static async generateFeeReport(month?: number, year?: number) {
    const query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      Object.assign(query, {
        createdAt: { $gte: startDate, $lt: endDate },
      });
    }

    const fees = await FeePayment.find(query);
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paid = fees.filter((f) => f.status === "Paid").reduce((sum, fee) => sum + fee.amount, 0);
    const pending = fees.filter((f) => f.status === "Pending").reduce((sum, fee) => sum + fee.amount, 0);

    return { total, paid, pending, feeCount: fees.length };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeePayment, Student } from "../types";

export interface FeeReceiptData {
  studentName: string;
  parentName: string;
  transactionId: string;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  paymentStatus: string;
  invoiceTitle: string;
  footerEmail?: string;
}

export function buildFeeReceiptFromPayment(
  fee: FeePayment,
  students: Student[],
  parentNameOverride?: string
): FeeReceiptData {
  const student = students.find((s) => s.id === fee.studentId);
  const parentEmail = student?.parentEmail || "parent@example.com";
  const parentName =
    parentNameOverride ||
    parentEmail
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    studentName: fee.studentName || student?.name || "Student",
    parentName,
    transactionId: fee.transactionId || `AF-TXN-${fee.id}`,
    amountPaid: fee.amount,
    paymentMethod: fee.status === "Paid" ? "Card" : "Pending",
    paymentDate: fee.dueDate,
    paymentStatus: fee.status,
    invoiceTitle: fee.title,
    footerEmail: parentEmail,
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { FeeService } from "../services/FeeService";

export class FeeController {
  static async createFee(req: AuthenticatedRequest, res: Response) {
    try {
      const { feeId, studentId, studentName, title, amount, dueDate } = req.body;

      if (!studentId || !title || !amount || !dueDate) {
        return res.status(400).json({ error: "studentId, title, amount, and dueDate are required" });
      }

      const fee = await FeeService.createFee(
        studentId,
        title,
        Number(amount),
        new Date(dueDate),
        feeId,
        studentName
      );

      res.status(201).json({
        message: "Fee created successfully",
        fee,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllFees(req: AuthenticatedRequest, res: Response) {
    try {
      const fees = await FeeService.getAllFees();
      res.json(fees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFeesByStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const fees = await FeeService.getFeesByStudent(studentId);

      res.json(fees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFeeById(req: AuthenticatedRequest, res: Response) {
    try {
      const { feeId } = req.params;
      const fee = await FeeService.getFeeById(feeId);

      if (!fee) {
        return res.status(404).json({ error: "Fee not found" });
      }

      res.json(fee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateFeePayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { feeId } = req.params;
      const { transactionId, paymentMethod } = req.body;

      const fee = await FeeService.updateFeePayment(
        feeId,
        transactionId || `AF-TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        paymentMethod || "Online"
      );

      if (!fee) {
        return res.status(404).json({ error: "Fee not found" });
      }

      res.json({
        message: "Fee payment updated successfully",
        fee,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPendingFees(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.query;
      const fees = await FeeService.getPendingFees(studentId as string);

      res.json(fees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPendingApprovals(req: AuthenticatedRequest, res: Response) {
    try {
      const fees = await FeeService.getPendingApprovals();
      res.json(fees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateApproval(req: AuthenticatedRequest, res: Response) {
    try {
      const { feeId } = req.params;
      const { status } = req.body;
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "status must be Approved or Rejected" });
      }
      const fee = await FeeService.updateApprovalStatus(feeId, status);
      if (!fee) {
        return res.status(404).json({ error: "Fee not found" });
      }
      res.json({ message: `Registration fee ${status.toLowerCase()}`, fee });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getFeeReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { month, year } = req.query;
      const report = await FeeService.generateFeeReport(
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { FeeService } = require("../services/FeeService");

class FeeController {
  static async createFee(req, res) {
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllFees(req, res) {
    try {
      const fees = await FeeService.getAllFees();
      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFeesByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const fees = await FeeService.getFeesByStudent(studentId);

      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFeeById(req, res) {
    try {
      const { feeId } = req.params;
      const fee = await FeeService.getFeeById(feeId);

      if (!fee) {
        return res.status(404).json({ error: "Fee not found" });
      }

      res.json(fee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateFeePayment(req, res) {
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPendingFees(req, res) {
    try {
      const { studentId } = req.query;
      const fees = await FeeService.getPendingFees(studentId);

      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPendingApprovals(req, res) {
    try {
      const fees = await FeeService.getPendingApprovals();
      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateApproval(req, res) {
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getFeeReport(req, res) {
    try {
      const { month, year } = req.query;
      const report = await FeeService.generateFeeReport(
        month ? parseInt(month) : undefined,
        year ? parseInt(year) : undefined
      );

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = { FeeController };

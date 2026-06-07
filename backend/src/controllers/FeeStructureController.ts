/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { FeeStructure } from "../models/FeeStructure";

export class FeeStructureController {
  // Get all fee structures
  static async getAll(req: Request, res: Response) {
    const structures = await FeeStructure.find().sort({ className: 1, subject: 1 });
    return res.status(200).json(structures);
  }

  // Get fee structures by class
  static async getByClass(req: Request, res: Response) {
    const { className } = req.params;
    const structures = await FeeStructure.find({ className }).sort({ subject: 1 });
    return res.status(200).json(structures);
  }

  // Create or update a fee structure (upsert)
  static async upsert(req: Request, res: Response) {
    const { className, subject, amount, frequency } = req.body;

    if (!className || !subject || amount === undefined) {
      return res.status(400).json({ message: "Please provide className, subject, and amount." });
    }

    const structure = await FeeStructure.findOneAndUpdate(
      { className, subject },
      { className, subject, amount, frequency: frequency || "Monthly" },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json(structure);
  }

  // Bulk upsert fee structures for a class
  static async bulkUpsert(req: Request, res: Response) {
    const { className, subjects } = req.body;

    if (!className || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Please provide className and subjects array." });
    }

    const results = await Promise.all(
      subjects.map((s: { subject: string; amount: number; frequency?: string }) =>
        FeeStructure.findOneAndUpdate(
          { className, subject: s.subject },
          { className, subject: s.subject, amount: s.amount, frequency: s.frequency || "Monthly" },
          { upsert: true, new: true, runValidators: true }
        )
      )
    );

    return res.status(200).json(results);
  }

  // Delete a fee structure
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await FeeStructure.findByIdAndDelete(id);
    return res.status(200).json({ message: "Fee structure deleted." });
  }

  // Calculate total fee for a student based on class + enrolled subjects
  static async calculateStudentFee(req: Request, res: Response) {
    const { className, subjects } = req.body;

    if (!className || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Please provide className and subjects array." });
    }

    const structures = await FeeStructure.find({
      className,
      subject: { $in: subjects },
    });

    const breakdown = structures.map((s) => ({
      subject: s.subject,
      amount: s.amount,
      frequency: s.frequency,
    }));

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

    return res.status(200).json({ className, breakdown, total });
  }
}

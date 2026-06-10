/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { ResultService } = require("../services/ResultService");

class ResultController {
  static async getResultsByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const results = await ResultService.getResultsByStudent(studentId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async upsertResult(req, res) {
    try {
      const { studentId, term, gpa, mathsScore, physicsScore, literatureScore, compSciScore } = req.body;
      
      if (!studentId || !term || gpa === undefined) {
        return res.status(400).json({ error: "studentId, term, and gpa are required" });
      }

      const result = await ResultService.upsertResult({
        studentId,
        term,
        gpa: Number(gpa),
        mathsScore: mathsScore !== undefined ? Number(mathsScore) : undefined,
        physicsScore: physicsScore !== undefined ? Number(physicsScore) : undefined,
        literatureScore: literatureScore !== undefined ? Number(literatureScore) : undefined,
        compSciScore: compSciScore !== undefined ? Number(compSciScore) : undefined,
      });

      res.status(200).json({
        message: "Result recorded successfully",
        result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = { ResultController };

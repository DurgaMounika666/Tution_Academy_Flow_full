/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Result } = require("../models/Result");

class ResultService {
  static async getResultsByStudent(studentId) {
    return Result.find({ studentId }).sort({ createdAt: 1 });
  }

  static async upsertResult({ studentId, term, gpa, mathsScore, physicsScore, literatureScore, compSciScore }) {
    // Check if result already exists for this term and student
    let result = await Result.findOne({ studentId, term });
    
    if (result) {
      // Update existing
      result.gpa = gpa;
      if (mathsScore !== undefined) result.mathsScore = mathsScore;
      if (physicsScore !== undefined) result.physicsScore = physicsScore;
      if (literatureScore !== undefined) result.literatureScore = literatureScore;
      if (compSciScore !== undefined) result.compSciScore = compSciScore;
      return result.save();
    } else {
      // Create new
      const resultId = `RES-${Date.now()}`;
      result = new Result({
        resultId,
        studentId,
        term,
        gpa,
        mathsScore,
        physicsScore,
        literatureScore,
        compSciScore,
      });
      return result.save();
    }
  }
}

module.exports = { ResultService };

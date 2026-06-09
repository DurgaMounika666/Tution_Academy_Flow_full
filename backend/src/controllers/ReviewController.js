/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { ReviewService } = require("../services/ReviewService");

class ReviewController {
  static async createReview(req, res) {
    try {
      const { type, studentId, parentEmail, tutorId, tutorName, rating, comment, subject } = req.body;
      if (!type || !rating || !comment) {
        return res.status(400).json({ error: "type, rating, and comment are required" });
      }
      const review = await ReviewService.createReview({
        type,
        studentId,
        parentEmail,
        tutorId,
        tutorName,
        rating: Number(rating),
        comment,
        subject,
      });
      res.status(201).json({ message: "Review submitted", review });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getByStudent(req, res) {
    try {
      const reviews = await ReviewService.getByStudent(req.params.studentId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByParent(req, res) {
    try {
      const email = decodeURIComponent(req.params.parentEmail);
      const reviews = await ReviewService.getByParent(email);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByTutor(req, res) {
    try {
      const reviews = await ReviewService.getByTutor(req.params.tutorId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = { ReviewController };

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Review } = require("../models/Review");

class ReviewService {
  static async generateReviewId() {
    const count = await Review.countDocuments();
    return `RV-${1000 + count + 1}`;
  }

  static async createReview(data) {
    const review = new Review({
      reviewId: await this.generateReviewId(),
      ...data,
    });
    return review.save();
  }

  static async getByStudent(studentId) {
    return Review.find({ studentId, type: "student_tutor" }).sort({ createdAt: -1 });
  }

  static async getByParent(parentEmail) {
    return Review.find({ parentEmail, type: "parent_tuition" }).sort({ createdAt: -1 });
  }

  static async getByTutor(tutorId) {
    return Review.find({ tutorId, type: "student_tutor" }).sort({ createdAt: -1 });
  }

  static async getAll() {
    return Review.find().sort({ createdAt: -1 });
  }
}

module.exports = { ReviewService };

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Review } from "../models/Review";

export class ReviewService {
  static async generateReviewId() {
    const count = await Review.countDocuments();
    return `RV-${1000 + count + 1}`;
  }

  static async createReview(data: {
    type: "student_tutor" | "parent_tuition";
    studentId?: string;
    parentEmail?: string;
    tutorId?: string;
    tutorName?: string;
    rating: number;
    comment: string;
    subject?: string;
  }) {
    const review = new Review({
      reviewId: await this.generateReviewId(),
      ...data,
    });
    return review.save();
  }

  static async getByStudent(studentId: string) {
    return Review.find({ studentId, type: "student_tutor" }).sort({ createdAt: -1 });
  }

  static async getByParent(parentEmail: string) {
    return Review.find({ parentEmail, type: "parent_tuition" }).sort({ createdAt: -1 });
  }

  static async getByTutor(tutorId: string) {
    return Review.find({ tutorId, type: "student_tutor" }).sort({ createdAt: -1 });
  }

  static async getAll() {
    return Review.find().sort({ createdAt: -1 });
  }
}

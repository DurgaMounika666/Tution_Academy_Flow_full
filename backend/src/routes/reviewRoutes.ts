/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, ReviewController.createReview);
router.get("/student/:studentId", authMiddleware, ReviewController.getByStudent);
router.get("/parent/:parentEmail", authMiddleware, ReviewController.getByParent);
router.get("/tutor/:tutorId", authMiddleware, ReviewController.getByTutor);

export default router;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { ReviewController } = require("../controllers/ReviewController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

router.post("/", authMiddleware, ReviewController.createReview);
router.get("/student/:studentId", authMiddleware, ReviewController.getByStudent);
router.get("/parent/:parentEmail", authMiddleware, ReviewController.getByParent);
router.get("/tutor/:tutorId", authMiddleware, ReviewController.getByTutor);

module.exports = router;

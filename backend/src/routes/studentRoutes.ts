/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { StudentController } from "../controllers/StudentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/:studentId", authMiddleware, StudentController.getStudentById);
router.get(
  "/parent/:parentEmail",
  authMiddleware,
  StudentController.getStudentsByParent
);
router.post("/", authMiddleware, StudentController.createStudent);
router.put("/:studentId", authMiddleware, StudentController.updateStudent);
router.post("/:studentId/assign-tutor", authMiddleware, StudentController.assignTutor);
router.post(
  "/:studentId/learning-subjects",
  authMiddleware,
  StudentController.addLearningSubjects
);

export default router;

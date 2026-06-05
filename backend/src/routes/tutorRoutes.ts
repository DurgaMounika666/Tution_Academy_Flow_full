/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { TutorController } from "../controllers/TutorController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", TutorController.getAllTutors);
router.post("/", authMiddleware, TutorController.createTutor);
router.get("/by-email/:email", TutorController.getTutorByEmail);
router.get("/:tutorId", TutorController.getTutorById);
router.put("/:tutorId", authMiddleware, TutorController.updateTutor);
router.delete("/:tutorId", authMiddleware, TutorController.deleteTutor);

export default router;

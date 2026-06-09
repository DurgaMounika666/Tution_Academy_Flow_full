/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { TutorController } = require("../controllers/TutorController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

router.get("/", TutorController.getAllTutors);
router.post("/", authMiddleware, TutorController.createTutor);
router.get("/by-email/:email", TutorController.getTutorByEmail);
router.get("/:tutorId", TutorController.getTutorById);
router.put("/:tutorId", authMiddleware, TutorController.updateTutor);
router.delete("/:tutorId", authMiddleware, TutorController.deleteTutor);

module.exports = router;

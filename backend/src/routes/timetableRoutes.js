/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { TimetableController } = require("../controllers/TimetableController");

const router = Router();

// GET /api/timetable - all schedules
router.get("/", TimetableController.getAll);

// GET /api/timetable/summary - admin summary (tutors + their schedules + students)
router.get("/summary", TimetableController.getSummary);

// GET /api/timetable/tutor/:tutorId
router.get("/tutor/:tutorId", TimetableController.getByTutor);

// GET /api/timetable/student/:studentId
router.get("/student/:studentId", TimetableController.getByStudent);

// POST /api/timetable - create
router.post("/", TimetableController.create);

// PUT /api/timetable/:scheduleId - update
router.put("/:scheduleId", TimetableController.update);

// DELETE /api/timetable/:scheduleId - deactivate
router.delete("/:scheduleId", TimetableController.remove);

module.exports = router;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { authMiddleware } = require("../middleware/auth");
const { Attendance } = require("../models/Attendance");
const { Assignment } = require("../models/Assignment");

const router = Router();

// Attendance Routes
router.post("/mark", authMiddleware, async (req, res) => {
  try {
    const { date, studentId, status, batchId } = req.body;
    const attendanceId = `ATT-${Date.now()}`;

    const attendance = new Attendance({
      attendanceId,
      studentId,
      date: new Date(date),
      status,
      batchId,
    });

    await attendance.save();

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ studentId });

    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    res.json({
      studentId,
      attendanceRate: Math.round(attendanceRate),
      presentCount: present,
      absentCount: total - present,
      records,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assignment Routes
router.post("/assignments", authMiddleware, async (req, res) => {
  try {
    const { tutorId, title, subject, dueDate, description } = req.body;
    const assignmentId = `ASS-${Date.now()}`;

    const assignment = new Assignment({
      assignmentId,
      tutorId,
      title,
      subject,
      dueDate: new Date(dueDate),
      description,
      status: "Active",
    });

    await assignment.save();

    res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/tutor/:tutorId/assignments", authMiddleware, async (req, res) => {
  try {
    const { tutorId } = req.params;
    const assignments = await Assignment.find({ tutorId });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

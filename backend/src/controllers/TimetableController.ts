/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { Timetable } from "../models/Timetable";
import { Tutor } from "../models/Tutor";
import { Student } from "../models/Student";

export class TimetableController {
  // GET /api/timetable - get all schedules
  static async getAll(req: Request, res: Response) {
    try {
      const schedules = await Timetable.find({ isActive: true }).sort({ day: 1, startTime: 1 });
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/timetable/tutor/:tutorId - get schedules for a specific tutor
  static async getByTutor(req: Request, res: Response) {
    try {
      const { tutorId } = req.params;
      const schedules = await Timetable.find({ tutorId, isActive: true }).sort({ day: 1, startTime: 1 });
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/timetable/student/:studentId - get schedules for a student
  static async getByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const schedules = await Timetable.find({
        assignedStudentIds: studentId,
        isActive: true,
      }).sort({ day: 1, startTime: 1 });
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/timetable - admin create schedule
  static async create(req: Request, res: Response) {
    try {
      const {
        scheduleId,
        tutorId,
        subject,
        grade,
        day,
        startTime,
        endTime,
        mode,
        room,
        assignedStudentIds,
      } = req.body;

      if (!tutorId || !subject || !grade || !day || !startTime || !endTime) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const tutor = await Tutor.findOne({ tutorId });
      if (!tutor) {
        return res.status(404).json({ error: "Tutor not found" });
      }

      const sid = scheduleId || `SCH-${Date.now()}`;

      const schedule = await Timetable.create({
        scheduleId: sid,
        tutorId,
        tutorName: tutor.name,
        subject,
        grade,
        day,
        startTime,
        endTime,
        mode: mode || "Offline",
        room,
        assignedStudentIds: assignedStudentIds || [],
        isActive: true,
      });

      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /api/timetable/:scheduleId - admin update schedule
  static async update(req: Request, res: Response) {
    try {
      const { scheduleId } = req.params;
      const updates = req.body;

      const schedule = await Timetable.findOneAndUpdate(
        { scheduleId },
        updates,
        { new: true }
      );

      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // DELETE /api/timetable/:scheduleId - admin delete schedule
  static async remove(req: Request, res: Response) {
    try {
      const { scheduleId } = req.params;
      const schedule = await Timetable.findOneAndUpdate(
        { scheduleId },
        { isActive: false },
        { new: true }
      );

      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      res.json({ message: "Schedule removed successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // GET /api/timetable/summary - admin overview of all tutors and their schedules
  static async getSummary(req: Request, res: Response) {
    try {
      const tutors = await Tutor.find();
      const summaries = await Promise.all(
        tutors.map(async (tutor) => {
          const schedules = await Timetable.find({ tutorId: tutor.tutorId, isActive: true });
          const students = await Student.find({ studentId: { $in: tutor.assignedStudentIds } });
          return {
            tutorId: tutor.tutorId,
            tutorName: tutor.name,
            specialty: tutor.specialty,
            totalStudents: tutor.assignedStudentIds.length,
            totalSchedules: schedules.length,
            students: students.map((s) => ({ studentId: s.studentId, name: s.name, grade: s.grade })),
            schedules,
          };
        })
      );
      res.json(summaries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

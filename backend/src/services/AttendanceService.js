/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Attendance } = require("../models/Attendance");

class AttendanceService {
  static async markAttendance(
    attendanceId,
    studentId,
    date,
    status,
    batchId
  ) {
    const attendance = new Attendance({
      attendanceId,
      studentId,
      date,
      status,
      batchId,
    });

    return attendance.save();
  }

  static async getStudentAttendance(studentId) {
    return Attendance.find({ studentId }).sort({ date: -1 });
  }

  static async getAttendanceReport(studentId, month, year) {
    const query = { studentId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const records = await Attendance.find(query);
    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const late = records.filter((r) => r.status === "Late").length;

    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    return {
      studentId,
      attendanceRate: Math.round(attendanceRate),
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      totalDays: total,
      records,
    };
  }

  static async markBatchAttendance(
    date,
    batchId,
    attendance
  ) {
    const attendanceRecords = attendance.map((record, index) => ({
      attendanceId: `ATT-${batchId}-${date.getTime()}-${index}`,
      studentId: record.studentId,
      date,
      status: record.status,
      batchId,
    }));

    return Attendance.insertMany(attendanceRecords);
  }
}

module.exports = { AttendanceService };

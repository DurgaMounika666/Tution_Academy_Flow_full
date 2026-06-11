/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const bcrypt = require("bcryptjs");
const { ParentRegistration } = require("../models/ParentRegistration");
const { User } = require("../models/User");
const { Parent } = require("../models/Parent");
const { Student } = require("../models/Student");
const { Tutor } = require("../models/Tutor");
const { FeeService } = require("../services/FeeService");

class RegistrationController {
  static async getAllRegistrations(req, res) {
    try {
      const registrations = await ParentRegistration.find().sort({ createdAt: -1 });
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateRegistrationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // "Approved" or "Rejected"

      if (status !== "Approved" && status !== "Rejected") {
        return res.status(400).json({ error: "Invalid registration status" });
      }

      const registration = await ParentRegistration.findById(id);
      if (!registration) {
        return res.status(404).json({ error: "Registration request not found" });
      }

      if (registration.registrationStatus === "Approved") {
        return res.status(400).json({ error: "Registration is already approved" });
      }

      if (status === "Approved") {
        const normalizedEmail = registration.email.toLowerCase().trim();
        
        // 1. Ensure parent User account exists and is active
        let parentUser = await User.findOne({ email: normalizedEmail });
        if (parentUser) {
          parentUser.role = "parent";
          parentUser.isActive = true;
          await parentUser.save();
        } else {
          parentUser = new User({
            email: normalizedEmail,
            password: registration.password, // This was already hashed during registration request!
            role: "parent",
            isActive: true,
          });
          await parentUser.save();
        }

        // 2. Generate Student User Credentials
        const studentCount = await Student.countDocuments();
        const studentId = `ST-${100 + studentCount + 1}`;
        
        let studentEmail = `${registration.studentName.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.academyflow.com`;
        const existingStudentUser = await User.findOne({ email: studentEmail });
        if (existingStudentUser) {
          studentEmail = `${registration.studentName.toLowerCase().replace(/[^a-z0-9]/g, "")}.${Date.now().toString().slice(-4)}@student.academyflow.com`;
        }

        const studentHashedPassword = await bcrypt.hash("password", 10);
        const studentUser = new User({
          email: studentEmail,
          password: studentHashedPassword,
          role: "student",
          isActive: true,
        });
        await studentUser.save();

        // 3. Ensure Parent Profile exists and link child
        let parentProfile = await Parent.findOne({ email: normalizedEmail });
        if (!parentProfile) {
          parentProfile = await Parent.create({
            userId: parentUser._id,
            email: normalizedEmail,
            name: registration.parentName,
            phone: registration.phone,
            address: registration.location,
            childrenIds: [studentId],
          });
        } else {
          parentProfile = await Parent.findOneAndUpdate(
            { email: normalizedEmail },
            { $addToSet: { childrenIds: studentId } },
            { new: true }
          );
        }

        // Find tutors who teach selected courses
        const selectedCourses = registration.selectedCourses || [];
        const matchedTutors = await Tutor.find({
          subjects: { $in: selectedCourses }
        });
        
        // Filter out tutors whose User accounts are inactive
        const matchedTutorIds = [];
        for (const tutor of matchedTutors) {
          const user = await User.findById(tutor.userId);
          if (user && user.isActive) {
            matchedTutorIds.push(tutor.tutorId);
          }
        }

        // 4. Create Student Profile
        await Student.create({
          studentId,
          userId: studentUser._id,
          name: registration.studentName,
          grade: registration.classGrade,
          section: "Section A",
          parentEmail: normalizedEmail,
          parentId: parentProfile._id,
          assignedTutorIds: matchedTutorIds,
          learningSubjects: selectedCourses.length > 0 ? selectedCourses : ["Mathematics"],
          classMode: registration.classMode,
          phone: registration.phone,
          address: registration.location,
          attendanceRate: 100,
          presentCount: 0,
          absentCount: 0,
        });

        // Update matched tutors with the new student ID
        if (matchedTutorIds.length > 0) {
          await Tutor.updateMany(
            { tutorId: { $in: matchedTutorIds } },
            { $addToSet: { assignedStudentIds: studentId } }
          );
        }

        // 5. Create FeePayment record for advance fee
        await FeeService.createFee(
          studentId,
          "Enrollment & Registration Fee (Advance)",
          registration.advanceFeeAmount,
          new Date(),
          undefined,
          registration.studentName
        ).then(async (fee) => {
          fee.approvalStatus = "Approved";
          fee.status = "Paid";
          fee.transactionId = registration.transactionId;
          fee.paymentMethod = "Registration";
          await fee.save();
        });
      } else if (status === "Rejected") {
        // Rejecting: Disable login if a user exists
        const user = await User.findOne({ email: registration.email.toLowerCase().trim() });
        if (user) {
          user.isActive = false;
          await user.save();
        }
      }

      // Update registration record status
      registration.registrationStatus = status;
      registration.approvedBy = req.role || "admin";
      registration.approvedDate = new Date();
      await registration.save();

      res.json({
        message: `Registration has been successfully ${status.toLowerCase()}`,
        registration,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = { RegistrationController };

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Parent } from "../models/Parent";
import { Tutor } from "../models/Tutor";
import { Student } from "../models/Student";
import { FeeService } from "./FeeService";
import { config } from "../config/env";

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(
    userId: string,
    role: string,
    expiresIn?: string
  ): string {
    return jwt.sign(
      { userId, role },
      config.jwtSecret,
      {
        expiresIn: (expiresIn || config.jwtExpire) as any,
      }
    );
  }

  static generateRefreshToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      config.jwtRefreshSecret,
      {
        expiresIn: config.jwtRefreshExpire as any,
      }
    );
  }

  static verifyToken(token: string): { userId: string; role: string } {
    return jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: string;
    };
  }

  static async registerParent(
    email: string,
    password: string,
    name?: string,
    phone?: string,
    childName?: string,
    childGrade?: string,
    classMode?: string
  ) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new Error("An account with this email already exists. Please login.");
      }

      const hashedPassword = await this.hashPassword(password);
      const user = new User({
        email: normalizedEmail,
        password: hashedPassword,
        role: "parent",
      });
      await user.save();

      // Determine child details if provided
      let studentId = "";
      if (childName) {
        try {
          const studentCount = await Student.countDocuments();
          studentId = `ST-${100 + studentCount + 1}`;
        } catch (err) {
          studentId = `ST-${Date.now()}`;
        }

        let studentEmail = `${childName.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.academyflow.com`;
        const existingStudentUser = await User.findOne({ email: studentEmail });
        if (existingStudentUser) {
          studentEmail = `${childName.toLowerCase().replace(/[^a-z0-9]/g, "")}.${Date.now().toString().slice(-4)}@student.academyflow.com`;
        }

        const studentHashedPassword = await this.hashPassword("password");
        const studentUser = new User({
          email: studentEmail,
          password: studentHashedPassword,
          role: "student",
        });
        await studentUser.save();

        await Student.create({
          studentId,
          userId: studentUser._id,
          name: childName,
          grade: childGrade || "9th Class",
          section: "Section A",
          parentEmail: normalizedEmail,
          parentId: user._id,
          assignedTutorIds: ["T-201"],
          learningSubjects: ["Basic Mathematics"],
          classMode: classMode || "Online",
          phone: phone || "",
          attendanceRate: 100,
          presentCount: 0,
          absentCount: 0,
        });

        await FeeService.createFee(
          studentId,
          "Enrollment & Registration Fee (Advance)",
          150,
          new Date(),
          undefined,
          childName
        ).then(async (fee) => {
          fee.approvalStatus = "PendingApproval";
          fee.status = "Paid";
          fee.transactionId = `REG-${Date.now()}`;
          fee.paymentMethod = "Registration";
          await fee.save();
        });
      }

      let parentRecord = await Parent.findOne({ email: normalizedEmail });
      if (!parentRecord) {
        parentRecord = await Parent.create({
          userId: user._id,
          email: normalizedEmail,
          name: name || normalizedEmail.split("@")[0],
          phone: phone || "",
          childrenIds: studentId ? [studentId] : [],
        });
      } else if (studentId) {
        await Parent.findOneAndUpdate(
          { email: normalizedEmail },
          { $addToSet: { childrenIds: studentId } }
        );
      }

      if (studentId) {
        await Student.findOneAndUpdate(
          { studentId },
          { parentId: parentRecord._id }
        );
      }

      const token = this.generateToken(user._id.toString(), "parent");
      const refreshToken = this.generateRefreshToken(user._id.toString(), "parent");

      return { token, refreshToken, userId: user._id.toString(), email: normalizedEmail, studentId };
    } catch (error) {
      throw error;
    }
  }

  static async loginParent(email: string, password: string) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail, role: "parent" }).select("+password");
      if (!user) {
        throw new Error("Invalid credentials. Please check your email and password.");
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid credentials. Please check your email and password.");
      }

      // Fetch parent profile for additional info
      const parentProfile = await Parent.findOne({ email: normalizedEmail });

      const token = this.generateToken(user._id.toString(), "parent");
      const refreshToken = this.generateRefreshToken(user._id.toString(), "parent");

      return {
        token,
        refreshToken,
        userId: user._id.toString(),
        email: normalizedEmail,
        parentName: parentProfile?.name || "",
        childrenIds: parentProfile?.childrenIds || [],
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginStudent(studentId: string) {
    try {
      const student = await Student.findOne({ studentId: studentId.trim() });
      if (!student) {
        throw new Error("Invalid student ID. Please check and try again.");
      }

      const token = this.generateToken(studentId, "student");
      const refreshToken = this.generateRefreshToken(studentId, "student");
      return {
        token,
        refreshToken,
        userId: studentId,
        studentName: student.name,
        parentEmail: student.parentEmail,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginTutor(email: string, password: string) {
    try {
      const user = await User.findOne({ email, role: "tutor" }).select("+password");
      if (!user) {
        throw new Error("Invalid tutor credentials. Please check your email.");
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid credentials.");
      }

      // Fetch tutor profile
      const tutorProfile = await Tutor.findOne({ email });

      const token = this.generateToken(user._id.toString(), "tutor");
      const refreshToken = this.generateRefreshToken(user._id.toString(), "tutor");

      return {
        token,
        refreshToken,
        userId: user._id.toString(),
        tutorId: tutorProfile?.tutorId || "",
        tutorName: tutorProfile?.name || "",
        email,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginAdmin(email: string, password: string) {
    try {
      if (
        email === config.adminEmail &&
        password === config.adminPassword
      ) {
        const adminId = "admin-001";
        const token = this.generateToken(adminId, "admin");
        const refreshToken = this.generateRefreshToken(adminId, "admin");
        return { token, refreshToken, userId: adminId };
      }
      throw new Error("Invalid admin credentials.");
    } catch (error) {
      throw error;
    }
  }
}

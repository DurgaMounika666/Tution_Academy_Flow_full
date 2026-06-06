/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Parent } from "../models/Parent";
import { Tutor } from "../models/Tutor";
import { Student } from "../models/Student";
import { FeeService } from "./FeeService";
import { config } from "../config/env";

type ResetRole = "student" | "parent" | "tutor" | "admin";

interface PasswordResetRecord {
  role: ResetRole;
  email: string;
  studentId?: string;
  userId: string;
  otp: string;
  expiresAt: number;
  resetToken?: string;
}

export class AuthService {
  private static passwordResetOtps = new Map<string, PasswordResetRecord>();
  private static adminOverridePassword: string | null = null;

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

  private static buildResetKey(role: ResetRole, email: string, studentId?: string) {
    return `${role}:${studentId || ""}:${email.toLowerCase().trim()}`;
  }

  private static async resolvePasswordResetTarget(role: ResetRole, email: string, studentId?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    if (role === "student") {
      if (!studentId) {
        throw new Error("Student ID is required for student password reset.");
      }

      const student = await Student.findOne({ studentId: studentId.trim().toUpperCase() });
      if (!student || student.parentEmail.toLowerCase() !== normalizedEmail) {
        throw new Error("Student ID and verification email do not match our records.");
      }

      return {
        role,
        email: normalizedEmail,
        studentId: student.studentId,
        userId: student.userId.toString(),
      };
    }

    if (role === "admin") {
      if (normalizedEmail !== config.adminEmail.toLowerCase()) {
        throw new Error("Admin verification email is invalid.");
      }

      return {
        role,
        email: normalizedEmail,
        userId: "admin-001",
      };
    }

    const user = await User.findOne({ email: normalizedEmail, role });
    if (!user) {
      throw new Error("No active account was found for this email and role.");
    }

    return {
      role,
      email: normalizedEmail,
      userId: user._id.toString(),
    };
  }

  static async requestPasswordResetOtp(role: ResetRole, email: string, studentId?: string) {
    const target = await this.resolvePasswordResetTarget(role, email, studentId);
    const otp = crypto.randomInt(100000, 999999).toString();
    const key = this.buildResetKey(role, target.email, target.studentId);

    this.passwordResetOtps.set(key, {
      ...target,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`[Academy Flow] Password reset OTP for ${role} ${target.email}: ${otp}`);

    return {
      role,
      email: target.email,
      expiresInMinutes: 10,
      ...(config.nodeEnv !== "production" ? { otp } : {}),
    };
  }

  static async verifyPasswordResetOtp(role: ResetRole, email: string, otp: string, studentId?: string) {
    const target = await this.resolvePasswordResetTarget(role, email, studentId);
    const key = this.buildResetKey(role, target.email, target.studentId);
    const record = this.passwordResetOtps.get(key);

    if (!record || record.otp !== otp.trim() || record.expiresAt < Date.now()) {
      throw new Error("Invalid or expired OTP. Please request a new code.");
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    this.passwordResetOtps.set(key, { ...record, resetToken });

    return { resetToken };
  }

  static async resetPassword(resetToken: string, newPassword: string, confirmPassword: string) {
    if (!newPassword || newPassword !== confirmPassword) {
      throw new Error("New password and confirm password must match.");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const entry = Array.from(this.passwordResetOtps.entries()).find(
      ([, record]) => record.resetToken === resetToken && record.expiresAt >= Date.now()
    );

    if (!entry) {
      throw new Error("Reset session expired. Please verify your email again.");
    }

    const [key, record] = entry;

    if (record.role === "admin") {
      this.adminOverridePassword = newPassword;
      this.passwordResetOtps.delete(key);
      return { role: record.role };
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await User.findByIdAndUpdate(record.userId, { password: hashedPassword });
    this.passwordResetOtps.delete(key);

    return { role: record.role };
  }

  static async loginStudent(studentId: string, password: string) {
    try {
      const student = await Student.findOne({ studentId: studentId.trim() });
      if (!student) {
        throw new Error("Invalid student ID. Please check and try again.");
      }

      if (!password) {
        throw new Error("Student ID and password are required.");
      }

      const user = await User.findOne({ _id: student.userId, role: "student" }).select("+password");
      if (!user) {
        throw new Error("Student account credentials were not found.");
      }

      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid student ID or password.");
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
        (password === config.adminPassword || password === this.adminOverridePassword)
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

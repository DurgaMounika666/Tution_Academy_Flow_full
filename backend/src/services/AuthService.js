/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { Parent } = require("../models/Parent");
const { Tutor } = require("../models/Tutor");
const { Student } = require("../models/Student");
const { ParentRegistration } = require("../models/ParentRegistration");
const { config } = require("../config/env");

class AuthService {
  static passwordResetOtps = new Map();
  static adminOverridePassword = null;

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId, role, expiresIn) {
    return jwt.sign(
      { userId, role },
      config.jwtSecret,
      {
        expiresIn: expiresIn || config.jwtExpire,
      }
    );
  }

  static generateRefreshToken(userId, role) {
    return jwt.sign(
      { userId, role },
      config.jwtRefreshSecret,
      {
        expiresIn: config.jwtRefreshExpire,
      }
    );
  }

  static verifyToken(token) {
    return jwt.verify(token, config.jwtSecret);
  }

  static async registerParent(
    email,
    password,
    name,
    phone,
    childName,
    childGrade,
    classMode,
    location,
    advanceFeeAmount,
    transactionId,
    paymentStatus,
    selectedCourses
  ) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new Error("An account with this email already exists. Please login.");
      }

      // Check if a pending or approved registration already exists
      const existingReg = await ParentRegistration.findOne({
        email: normalizedEmail,
        registrationStatus: { $in: ["Pending Approval", "Approved"] },
      });
      if (existingReg) {
        throw new Error("A registration request with this email already exists.");
      }

      const hashedPassword = await this.hashPassword(password);

      const registration = new ParentRegistration({
        parentName: name || normalizedEmail.split("@")[0],
        studentName: childName || "Student",
        classGrade: childGrade || "9th Class",
        classMode: classMode || "Online",
        location: location || "Hyderabad",
        phone: phone || "",
        email: normalizedEmail,
        password: hashedPassword,
        advanceFeeAmount: advanceFeeAmount || 150,
        transactionId: transactionId || `REG-${Date.now()}`,
        paymentStatus: paymentStatus || "Paid",
        registrationStatus: "Pending Approval",
        selectedCourses: selectedCourses || [],
      });

      await registration.save();

      return {
        message: "Parent registration request submitted. Awaiting admin approval.",
        registrationId: registration._id,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginParent(email, password) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail, role: "parent" }).select("+password");
      if (!user) {
        // Check if there is a pending or rejected registration for this email
        const registration = await ParentRegistration.findOne({ email: normalizedEmail });
        if (registration) {
          if (registration.registrationStatus === "Pending Approval") {
            throw new Error("Your registration is awaiting admin approval.");
          }
          if (registration.registrationStatus === "Rejected") {
            throw new Error("Your registration request has been rejected. Please contact the administrator.");
          }
        }
        throw new Error("Invalid credentials. Please check your email and password.");
      }

      if (!user.isActive) {
        throw new Error("Your registration request has been rejected. Please contact the administrator.");
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

  static buildResetKey(role, email, studentId) {
    return `${role}:${studentId || ""}:${email.toLowerCase().trim()}`;
  }

  static async resolvePasswordResetTarget(role, email, studentId) {
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

  static async requestPasswordResetOtp(role, email, studentId) {
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

  static async verifyPasswordResetOtp(role, email, otp, studentId) {
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

  static async resetPassword(resetToken, newPassword, confirmPassword) {
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

  static async loginStudent(studentId, password) {
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

  static async loginTutor(email, password) {
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

  static async loginAdmin(email, password) {
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

module.exports = { AuthService };

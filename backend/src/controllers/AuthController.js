/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { AuthService } = require("../services/AuthService");

class AuthController {
  static async registerParent(req, res) {
    try {
      const {
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
        selectedCourses,
      } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await AuthService.registerParent(
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
      );

      res.status(201).json({
        success: true,
        ...result,
        message: "Parent registration request submitted successfully",
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async loginStudent(req, res) {
    try {
      const { studentId, password } = req.body;

      if (!studentId || !password) {
        return res.status(400).json({ error: "Student ID and password are required" });
      }

      const result = await AuthService.loginStudent(studentId, password);

      res.json({
        message: "Student login successful",
        ...result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async loginParent(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await AuthService.loginParent(email, password);

      res.json({
        message: "Parent login successful",
        ...result,
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  static async loginTutor(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await AuthService.loginTutor(email, password);

      res.json({
        message: "Tutor login successful",
        ...result,
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  static async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await AuthService.loginAdmin(email, password);

      res.json({
        message: "Admin login successful",
        ...result,
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    res.json({ message: "Logout successful" });
  }

  static async requestPasswordResetOtp(req, res) {
    try {
      const { role, email, studentId } = req.body;

      if (!role || !email) {
        return res.status(400).json({ error: "Role and verification email are required" });
      }

      const result = await AuthService.requestPasswordResetOtp(role, email, studentId);
      res.json({
        message: "OTP sent to the verified email address",
        ...result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyPasswordResetOtp(req, res) {
    try {
      const { role, email, otp, studentId } = req.body;

      if (!role || !email || !otp) {
        return res.status(400).json({ error: "Role, email, and OTP are required" });
      }

      const result = await AuthService.verifyPasswordResetOtp(role, email, otp, studentId);
      res.json({
        message: "OTP verified successfully",
        ...result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { resetToken, newPassword, confirmPassword } = req.body;

      if (!resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "Reset token, new password, and confirm password are required" });
      }

      const result = await AuthService.resetPassword(resetToken, newPassword, confirmPassword);
      res.json({
        message: "Password updated successfully",
        ...result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = { AuthController };

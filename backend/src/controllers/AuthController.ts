/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  static async registerParent(req: Request, res: Response) {
    try {
      const { email, password, name, phone, childName, childGrade, classMode } = req.body;

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
        classMode
      );

      res.status(201).json({
        message: "Parent registered successfully",
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async loginStudent(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async loginParent(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async loginTutor(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async loginAdmin(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.json({ message: "Logout successful" });
  }

  static async requestPasswordResetOtp(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyPasswordResetOtp(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

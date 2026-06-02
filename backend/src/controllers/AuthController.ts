/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  static async registerParent(req: Request, res: Response) {
    try {
      const { email, password, childName, childGrade } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await AuthService.registerParent(
        email,
        password,
        childName,
        childGrade
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
      const { studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({ error: "Student ID is required" });
      }

      const result = await AuthService.loginStudent(studentId);

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
}

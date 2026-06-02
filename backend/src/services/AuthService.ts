/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User";
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
    childName?: string,
    childGrade?: string
  ) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await this.hashPassword(password);
      const user = new User({
        email,
        password: hashedPassword,
        role: "parent",
      });

      await user.save();

      const token = this.generateToken(user._id.toString(), "parent");
      const refreshToken = this.generateRefreshToken(user._id.toString(), "parent");

      return { token, refreshToken, userId: user._id.toString() };
    } catch (error) {
      throw error;
    }
  }

  static async loginParent(email: string, password: string) {
    try {
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      const token = this.generateToken(user._id.toString(), "parent");
      const refreshToken = this.generateRefreshToken(user._id.toString(), "parent");

      return { token, refreshToken, userId: user._id.toString() };
    } catch (error) {
      throw error;
    }
  }

  static async loginStudent(studentId: string) {
    try {
      const token = this.generateToken(studentId, "student");
      const refreshToken = this.generateRefreshToken(studentId, "student");
      return { token, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  static async loginTutor(email: string, password: string) {
    try {
      const user = await User.findOne({ email, role: "tutor" }).select("+password");
      if (!user) {
        throw new Error("Invalid tutor credentials");
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      const token = this.generateToken(user._id.toString(), "tutor");
      const refreshToken = this.generateRefreshToken(user._id.toString(), "tutor");

      return { token, refreshToken, userId: user._id.toString() };
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
        return { token, refreshToken };
      }
      throw new Error("Invalid admin credentials");
    } catch (error) {
      throw error;
    }
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Parent } from "../models/Parent";
import { Student } from "../models/Student";
import { User } from "../models/User";
import { AuthService } from "./AuthService";

export class ParentService {
  static async getAllParents() {
    return Parent.find().sort({ createdAt: -1 });
  }

  static async getParentByEmail(email: string) {
    const parent = await Parent.findOne({ email: email.toLowerCase() });
    if (!parent) return null;
    const children = await Student.find({ parentEmail: email.toLowerCase() });
    return { ...parent.toObject(), children };
  }

  static async getParentById(parentId: string) {
    const parent = await Parent.findById(parentId);
    if (!parent) return null;
    const children = await Student.find({ parentEmail: parent.email });
    return { ...parent.toObject(), children };
  }

  static async updateParent(email: string, updateData: Record<string, unknown>) {
    const allowed = ["name", "phone", "address", "occupation"];
    const filtered: Record<string, unknown> = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) filtered[key] = updateData[key];
    }
    return Parent.findOneAndUpdate({ email: email.toLowerCase() }, filtered, { new: true });
  }

  static async deleteParent(email: string) {
    const parent = await Parent.findOne({ email: email.toLowerCase() });
    if (!parent) return null;
    await User.deleteOne({ _id: parent.userId });
    await Parent.deleteOne({ email: email.toLowerCase() });
    return parent;
  }

  static async addChildToParent(email: string, studentId: string) {
    return Parent.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $addToSet: { childrenIds: studentId } },
      { new: true }
    );
  }

  static async createParent(
    email: string,
    password: string,
    name: string,
    phone?: string
  ) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const hashedPassword = await AuthService.hashPassword(password);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "parent",
    });
    await user.save();

    const parent = await Parent.create({
      userId: user._id,
      email: email.toLowerCase(),
      name,
      phone: phone || "",
      childrenIds: [],
    });

    return parent;
  }
}

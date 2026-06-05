/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { ParentService } from "../services/ParentService";

export class ParentController {
  static async getAllParents(req: Request, res: Response) {
    try {
      const parents = await ParentService.getAllParents();
      res.json(parents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getParentByEmail(req: Request, res: Response) {
    try {
      const email = decodeURIComponent(req.params.email);
      const parent = await ParentService.getParentByEmail(email);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json(parent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getParentById(req: Request, res: Response) {
    try {
      const parent = await ParentService.getParentById(req.params.parentId);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json(parent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createParent(req: Request, res: Response) {
    try {
      const { email, password, name, phone } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "email, password, and name are required" });
      }
      const parent = await ParentService.createParent(email, password, name, phone);
      res.status(201).json({ message: "Parent created successfully", parent });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateParent(req: Request, res: Response) {
    try {
      const email = decodeURIComponent(req.params.email);
      const parent = await ParentService.updateParent(email, req.body);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json({ message: "Parent updated successfully", parent });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteParent(req: Request, res: Response) {
    try {
      const email = decodeURIComponent(req.params.email);
      const parent = await ParentService.deleteParent(email);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json({ message: "Parent deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { ParentService } = require("../services/ParentService");

class ParentController {
  static async getAllParents(req, res) {
    try {
      const parents = await ParentService.getAllParents();
      res.json(parents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getParentByEmail(req, res) {
    try {
      const email = decodeURIComponent(req.params.email);
      const parent = await ParentService.getParentByEmail(email);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json(parent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getParentById(req, res) {
    try {
      const parent = await ParentService.getParentById(req.params.parentId);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json(parent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createParent(req, res) {
    try {
      const { email, password, name, phone } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "email, password, and name are required" });
      }
      const parent = await ParentService.createParent(email, password, name, phone);
      res.status(201).json({ message: "Parent created successfully", parent });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateParent(req, res) {
    try {
      const email = decodeURIComponent(req.params.email);
      const parent = await ParentService.updateParent(email, req.body);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json({ message: "Parent updated successfully", parent });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteParent(req, res) {
    try {
      const email = decodeURIComponent(req.params.email);
      const parent = await ParentService.deleteParent(email);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json({ message: "Parent deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = { ParentController };

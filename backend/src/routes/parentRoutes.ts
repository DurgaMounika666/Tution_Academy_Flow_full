/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { ParentController } from "../controllers/ParentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", ParentController.getAllParents);
router.post("/", authMiddleware, ParentController.createParent);
router.get("/by-email/:email", ParentController.getParentByEmail);
router.put("/by-email/:email", authMiddleware, ParentController.updateParent);
router.delete("/by-email/:email", authMiddleware, ParentController.deleteParent);
router.get("/:parentId", ParentController.getParentById);

export default router;

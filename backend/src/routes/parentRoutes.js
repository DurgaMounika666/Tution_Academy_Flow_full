/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { ParentController } = require("../controllers/ParentController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

router.get("/", ParentController.getAllParents);
router.post("/", authMiddleware, ParentController.createParent);
router.get("/by-email/:email", ParentController.getParentByEmail);
router.put("/by-email/:email", authMiddleware, ParentController.updateParent);
router.delete("/by-email/:email", authMiddleware, ParentController.deleteParent);
router.get("/:parentId", ParentController.getParentById);

module.exports = router;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { FeeStructureController } from "../controllers/FeeStructureController";

const router = Router();

router.get("/", FeeStructureController.getAll);
router.get("/class/:className", FeeStructureController.getByClass);
router.post("/", FeeStructureController.upsert);
router.post("/bulk", FeeStructureController.bulkUpsert);
router.post("/calculate", FeeStructureController.calculateStudentFee);
router.delete("/:id", FeeStructureController.delete);

export default router;

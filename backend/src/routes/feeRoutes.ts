/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { FeeController } from "../controllers/FeeController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, FeeController.createFee);
router.get("/pending/all", authMiddleware, FeeController.getPendingFees);
router.get("/pending/approvals", authMiddleware, FeeController.getPendingApprovals);
router.put("/:feeId/approval", authMiddleware, FeeController.updateApproval);
router.get("/reports/monthly", authMiddleware, FeeController.getFeeReport);
router.get("/all", authMiddleware, FeeController.getAllFees);
router.get("/fee/:feeId", authMiddleware, FeeController.getFeeById);
router.put("/:feeId/payment", authMiddleware, FeeController.updateFeePayment);
router.get("/:studentId", authMiddleware, FeeController.getFeesByStudent);

export default router;

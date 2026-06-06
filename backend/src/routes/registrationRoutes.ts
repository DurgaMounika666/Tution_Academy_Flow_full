/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { RegistrationController } from "../controllers/RegistrationController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

// Protect all registration management endpoints: only admins can access
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

router.get("/", RegistrationController.getAllRegistrations);
router.put("/:id/status", RegistrationController.updateRegistrationStatus);

export default router;

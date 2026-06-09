/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { RegistrationController } = require("../controllers/RegistrationController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = Router();

// Protect all registration management endpoints: only admins can access
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

router.get("/", RegistrationController.getAllRegistrations);
router.put("/:id/status", RegistrationController.updateRegistrationStatus);

module.exports = router;

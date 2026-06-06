/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();

router.post("/register-parent", AuthController.registerParent);
router.post("/login-student", AuthController.loginStudent);
router.post("/login-parent", AuthController.loginParent);
router.post("/login-tutor", AuthController.loginTutor);
router.post("/login-admin", AuthController.loginAdmin);
router.post("/forgot-password/request-otp", AuthController.requestPasswordResetOtp);
router.post("/forgot-password/verify-otp", AuthController.verifyPasswordResetOtp);
router.post("/forgot-password/reset", AuthController.resetPassword);
router.post("/logout", AuthController.logout);

export default router;

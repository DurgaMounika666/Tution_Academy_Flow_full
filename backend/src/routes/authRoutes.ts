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
router.post("/logout", AuthController.logout);

export default router;

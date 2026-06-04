/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { BookingController } from "../controllers/BookingController";

const router = Router();

router.post("/demo", BookingController.createDemoBooking);

export default router;

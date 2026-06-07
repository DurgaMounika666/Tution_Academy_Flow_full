/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { BookingController } from "../controllers/BookingController";

const router = Router();

router.post("/demo", BookingController.createDemoBooking);
router.get("/demo", BookingController.getAllDemoBookings);

export default router;

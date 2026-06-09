/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { BookingController } = require("../controllers/BookingController");

const router = Router();

router.post("/demo", BookingController.createDemoBooking);
router.get("/demo", BookingController.getAllDemoBookings);

module.exports = router;

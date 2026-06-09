/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { DemoBooking } = require("../models/DemoBooking");

class BookingController {
  static async getAllDemoBookings(req, res) {
    const bookings = await DemoBooking.find().sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  }

  static async createDemoBooking(req, res) {
    const { fullName, email, whatsappNumber, course, preferredDate, location, studentClass } = req.body;

    if (!fullName || !email || !whatsappNumber || !course) {
      return res.status(400).json({ message: "Please provide full name, email, WhatsApp number, and course." });
    }

    const booking = await DemoBooking.create({
      fullName,
      email,
      whatsappNumber,
      course,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      location,
      studentClass,
    });

    return res.status(201).json({
      success: true,
      bookingId: booking._id,
      message: "Your demo seat has been reserved.",
    });
  }
}

module.exports = { BookingController };

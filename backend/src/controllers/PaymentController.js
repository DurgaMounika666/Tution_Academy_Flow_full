/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const Razorpay = require("razorpay");
const crypto = require("crypto");
const { FeePayment } = require("../models/FeePayment");

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_placeholder",
});

class PaymentController {
  // 1. Create a Razorpay Order
  static async createOrder(req, res) {
    try {
      const { amount, feeId } = req.body;
      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      // If feeId is provided and is not registration, verify that the fee record exists
      if (feeId && feeId !== "REGISTRATION") {
        const fee = await FeePayment.findOne({ feeId });
        if (!fee) {
          return res.status(404).json({ error: `Fee record ${feeId} not found` });
        }
      }

      // Razorpay expects amount in paise (e.g., ₹150 = 15000 paise)
      const options = {
        amount: Math.round(amount * 100), 
        currency: "INR",
        receipt: feeId || `reg_${Date.now()}`,
      };

      const order = await razorpayInstance.orders.create(options);
      
      res.status(201).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 2. Verify Razorpay Payment Signature
  static async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feeId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing required signature verification fields" });
      }

      // HMAC SHA256 Signature verification
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_placeholder")
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
      }

      let updatedFee = null;
      // If feeId is provided and is not a registration payment, update the FeePayment in MongoDB
      if (feeId && feeId !== "REGISTRATION") {
        updatedFee = await FeePayment.findOneAndUpdate(
          { feeId: feeId },
          { 
            status: "Paid",
            transactionId: razorpay_payment_id,
            paymentMethod: "Razorpay Online",
            paidDate: new Date(),
            approvalStatus: "None"
          },
          { new: true }
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment successfully verified",
        transactionId: razorpay_payment_id,
        fee: updatedFee
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = { PaymentController };

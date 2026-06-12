/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { PaymentController } = require("../controllers/PaymentController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

// Allow authMiddleware, but since registration occurs pre-login, we permit public order creation and verification 
// if registration context is specified. Otherwise, enforce auth validation.
const optionalAuthMiddleware = (req, res, next) => {
  const { feeId } = req.body;
  if (feeId === "REGISTRATION") {
    return next(); // Skip token verification for new parent signup fee
  }
  return authMiddleware(req, res, next);
};

router.post("/create-order", optionalAuthMiddleware, PaymentController.createOrder);
router.post("/verify-payment", optionalAuthMiddleware, PaymentController.verifyPayment);

module.exports = router;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const jwt = require("jsonwebtoken");
const { config } = require("../config/env");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res
        .status(403)
        .json({ error: "Access denied: Insufficient permissions" });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
};

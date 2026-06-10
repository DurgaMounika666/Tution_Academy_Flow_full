/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { ResultController } = require("../controllers/ResultController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

router.get("/student/:studentId", authMiddleware, ResultController.getResultsByStudent);
router.post("/", authMiddleware, ResultController.upsertResult);

module.exports = router;

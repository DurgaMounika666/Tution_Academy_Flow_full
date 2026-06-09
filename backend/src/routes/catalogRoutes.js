/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { CatalogController } = require("../controllers/CatalogController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = Router();

// Public — anyone (including registration form) can read the catalog
router.get("/", CatalogController.getAll);

// Admin-only — modify catalog data
router.put("/subjects", authMiddleware, roleMiddleware(["admin"]), CatalogController.upsertSubjects);
router.put("/standards", authMiddleware, roleMiddleware(["admin"]), CatalogController.upsertStandards);
router.put("/locations", authMiddleware, roleMiddleware(["admin"]), CatalogController.upsertLocations);

module.exports = router;

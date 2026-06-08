/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { CatalogController } from "../controllers/CatalogController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

// Public — anyone (including registration form) can read the catalog
router.get("/", CatalogController.getAll);

// Admin-only — modify catalog data
router.put("/subjects", authMiddleware, roleMiddleware(["admin"]), CatalogController.upsertSubjects);
router.put("/standards", authMiddleware, roleMiddleware(["admin"]), CatalogController.upsertStandards);
router.put("/locations", authMiddleware, roleMiddleware(["admin"]), CatalogController.upsertLocations);

export default router;

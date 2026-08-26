import { Router } from "express";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

/**
 * Feature 1 foundation: a protected list read so session scoping can be proven.
 * Feature 2 replaces this with persisted list CRUD.
 */
router.get("/", [authenticate], (_req, res) => {
  res.status(200).send([]);
});

export default router;

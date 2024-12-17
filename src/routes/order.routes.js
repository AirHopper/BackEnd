import express from "express";
import { getAllUserOwned, create, getUserOwnedById, cancelUserOwnedById, getAll } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllUserOwned);
router.get("/admin", getAll);
router.get("/:id", getUserOwnedById); // beware it may overwrite below GET route
router.post("/", create);
router.post("/:id", cancelUserOwnedById);

export default router;
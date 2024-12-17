import express from "express";
import { getAllUserOwned, create, getUserOwnedById, cancelUserOwnedById, getAll } from "../controllers/order.controller.js";
import { validateCreateOrder } from "../middlewares/validator/order.validator.js";

const router = express.Router();

router.get("/", getAllUserOwned);
router.get("/admin", getAll);
router.get("/:id", getUserOwnedById); // beware it may overwrite below GET route
router.post("/", validateCreateOrder, create);
router.post("/:id", cancelUserOwnedById);

export default router;
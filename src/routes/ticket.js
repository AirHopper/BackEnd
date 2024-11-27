import express from "express";
import { getManyByUserId, create } from "../controllers/ticket.js";

const router = express.Router();

router.get("/", getManyByUserId);
router.post("/", create);

export default router;
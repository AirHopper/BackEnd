import express from "express";
import { getAllUserOwned, create, getUserOwnedById, cancelUserOwnedById, getAll } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllUserOwned);
router.get("/admin", getAll);
router.get("/:id", getUserOwnedById); // beware it may overwrite below GET route
router.patch("/:id", cancelUserOwnedById);
router.post("/", create);

import imagekit from "../utils/imageKit.js";
import QRCode from 'qrcode'
import dotenv from 'dotenv';
dotenv.config();

router.post("/test", async (req, res) => {
    try {
        const qrCodeData = await QRCode.toDataURL(`${process.env.APP_URL}/history`);
        const base64Data = qrCodeData.split(',')[1];
        const qrCodeBuffer = Buffer.from(base64Data, 'base64');
        const orderId = '123456789';
        const uploadResponse = await imagekit.upload({
            file: qrCodeBuffer, 
            fileName: `qrcode_${orderId}.png`, // Same file name will be overwritten to the new one, not gonna throw error
            folder: "/qrcode_images/",
            useUniqueFileName: false // no need to add unique suffix since orderId is unique
        });

        const urlLink = uploadResponse.url;

        res.status(200).json({
            success: true,
            message: 'It works',
            data: uploadResponse
        })
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

export default router;
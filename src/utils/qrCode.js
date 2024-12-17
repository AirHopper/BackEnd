import QRCode from 'qrcode';
import imagekit from "../utils/imageKit.js";
import dotenv from 'dotenv';
dotenv.config();

export const createQrCodeUrlByOrderId = async (orderId) =>  {
    const qrCodeData = await QRCode.toDataURL(`${process.env.APP_URL}/history`);
    const base64Data = qrCodeData.split(',')[1];
    const qrCodeBuffer = Buffer.from(base64Data, 'base64');
    const uploadedQris = await imagekit.upload({
        file: qrCodeBuffer, 
        fileName: `qrcode_${orderId}.png`, // Same file name will be overwritten to the new one, not gonna throw error
        folder: "/qrcode_images/",
        useUniqueFileName: false // no need to add unique suffix since orderId is unique
    });

    return uploadedQris.url;
}
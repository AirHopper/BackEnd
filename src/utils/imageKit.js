import dotenv from "dotenv";
dotenv.config();
import ImageKit from "imagekit";

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;
    
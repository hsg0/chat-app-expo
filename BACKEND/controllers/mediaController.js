// BACKEND/controllers/mediaController.js

import imageKitClient from "../config/imageKit.js";

export function getImageKitUploadAuth(req, res) {
  try {
    const authParams = imageKitClient.getAuthenticationParameters();

    return res.status(200).json({
      success: true,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      token: authParams.token,
      expire: authParams.expire,
      signature: authParams.signature,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create ImageKit upload authentication.",
    });
  }
}
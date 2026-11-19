import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const cloudinaryConfig = cloudinary.config();

console.log("Cloudinary upload configuration:", {
  cloudNameConfigured: Boolean(cloudinaryConfig.cloud_name),
  apiKeyConfigured: Boolean(cloudinaryConfig.api_key),
  apiSecretConfigured: Boolean(cloudinaryConfig.api_secret),
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "foodie/foods",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream);
  });
};

export default uploadToCloudinary;
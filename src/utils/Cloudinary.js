import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (tempFilePath, username = null, imageType, postId = null) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  try {

    // Step 1: Set folder and public_id based on image type (profile, cover, postId, or tag)
    let folderName;
    let publicId;
    let transformation = {};

    if (imageType === "profile" || imageType === "cover") {
      folderName = `users/${username}`;  // Correct folder for the user
      publicId = `${imageType}`;  // e.g., users/username/profile or users/username/cover
      transformation = { width: 512, height: 512, crop: "limit", quality: "auto", fetch_format: "auto" };
    } else if (imageType === "post" && postId) {
      folderName = `users/${username}`;  // Correct folder for the post
      publicId = `${postId}`;  // e.g., users/username/postId
      transformation = { width: 1920, height: 1080, crop: "limit", quality: "auto", fetch_format: "auto" };
    } else if (imageType === "tag") {
      folderName = `tags`;  // Correct folder for tags
      publicId = `${postId}`;  // e.g., tags/tagId
      transformation = { width: 512, height: 512, crop: "limit", quality: "auto", fetch_format: "auto" };
    } else if (imageType === "categories") {
      folderName = `categories`;
      publicId = `${postId}`;
      transformation = { width: 512, height: 512, crop: "limit", quality: "auto", fetch_format: "auto"  };
    }else {
      throw new Error("Invalid image type or missing parameters for image upload.");
    }

    // Step 2: Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      folder: folderName,        // Upload to user-specific folder
      public_id: publicId,       // Use the structured public_id
      transformation,            // Apply resizing for profile/cover images
      use_filename: false,       // Keep public_id structured
      overwrite: true,           // Overwrite to enable versioning
      unique_filename: false,    // Reuse the same public_id for versioning
      secure: true,              // Use HTTPS for the image URL
    });

    // Step 3: Delete the local file after uploading
    if (fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, (err) => {
        if (err) {
          console.error("Error while deleting the file:", err);
        }
      });
    } else {
      console.log("File not found, nothing to delete");
    }

    return uploadResult;
  } catch (error) {
    console.error(error);

    // Clean up the local file if an error occurs
    if (fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, (err) => {
        if (err) {
          console.error("Error while deleting the file:", err);
        }
      });
    } else {
      console.log("File not found, nothing to delete");
    }

    throw error;
  }
};

export const deleteImageFromCloudinary = async (imageUrl) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  try {
    // Step 1: Split URL into parts
    const urlParts = imageUrl.split('/'); // Split by "/"
    
    // Step 2: Remove the file extension from the image filename
    const imageFileName = urlParts.pop(); // Get the last part ("cover.jpg")
    const publicId = imageFileName.split('.')[0]; // Remove the file extension -> "cover"

    // Step 3: Extract the folder structure (if any)
    const folderPath = urlParts.slice(7).join('/'); // This will give the folder path (after "/upload/")

    // Step 4: Combine folder path and filename to create the full public ID
    const finalPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;

    // Step 5: Delete the image using the full public ID (folder + filename)
    await cloudinary.uploader.destroy(finalPublicId);
    console.log(`Deleted image with public ID: ${finalPublicId}`);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error; // Rethrow if you want to handle it elsewhere
  }
};
// Example Usage for Profile Image
//await uploadOnCloudinary(tempFilePath, 'john_doe', 'profile');

// Example Usage for Cover Image
//await uploadOnCloudinary(tempFilePath, 'john_doe', 'cover');

// Example Usage for Post Image
//await uploadOnCloudinary(tempFilePath, 'john_doe', 'post', 'abc123postId');

export default uploadOnCloudinary;

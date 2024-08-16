import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

const uploadOnCloudinary = async(tempFilePath) =>{
  
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET
    });
    
    try{
        const uploadResult = await cloudinary.uploader.upload(tempFilePath);
        fs.unlink(tempFilePath);
        return uploadResult;
    } catch (error){
        console.log(error);
        fs.unlink(tempFilePath);
    }
}

export default uploadOnCloudinary;
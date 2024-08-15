import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async(tempFilePath) =>{
    try{
        console.log(tempFilePath);
        const uploadResult = await cloudinary.uploader.upload(tempFilePath);
        console.log(uploadResult);
        return uploadResult;
    } catch (error){
        fs.unlinkSync(tempFilePath);
        return null;
    }
}

export default uploadOnCloudinary;
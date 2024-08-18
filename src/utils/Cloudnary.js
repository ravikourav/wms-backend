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
        if (fs.existsSync(tempFilePath)) {
            fs.unlink(tempFilePath, (err) => {
                if (err) {
                  console.error('Error while deleting the file:', err);
                } else {
                  console.log('File deleted successfully');
                }
            });
        } else {
            console.log('File not found, nothing to delete');
        }

        return uploadResult;
    } catch (error){
        console.log(error);
        if (fs.existsSync(tempFilePath)) {
            fs.unlink(tempFilePath, (err) => {
                if (err) {
                  console.error('Error while deleting the file:', err);
                } else {
                  console.log('File deleted successfully');
                }
            });
        } else {
            console.log('File not found, nothing to delete');
        }

        throw error;
    }
}

export default uploadOnCloudinary;
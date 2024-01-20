import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return console.log(null, "file not upload properly")
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has uploaded successfuly
        console.log(response.url, "file upload successfuly")
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // unlike the which is not upload on server
    }
}

export { uploadOnCloudinary };
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
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
        // unlike the which is not upload on server
    }
}

// pdf
const PdfuploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("File path not provided");
            return null;
        }
                const response = await cloudinary.uploader.upload(localFilePath, {
                    resource_type: "auto",
                    format: "pdf",
                    quality: 80,
        });
        console.log("File uploaded successfully:", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        fs.unlinkSync(localFilePath); // Delete the local file in case of error
        return null;
    }
};

export { uploadOnCloudinary,PdfuploadOnCloudinary };
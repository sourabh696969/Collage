import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { About } from "../models/aboutus_models.js";
import mongoose from "mongoose";


const uploadAbout = asyncHandler(async (req, res) => {
    const { title , description  } = req.body;
    if (
        [title,description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "title isrequired")
    }
    const AboutImageLocalPath = req.files?.AboutImage[0]?.path

    if (!AboutImageLocalPath) {
        throw new ApiError(400, "galler image is required")
    }

    const AboutImage = await uploadOnCloudinary(AboutImageLocalPath)

    const about = await About.create({
        title: title.toLowerCase(),
        description:description,
        AboutImage: AboutImage.url,
    })

    const createabout = await About.findById(about._id).select("-__v");

    if (!createabout) {
        throw new ApiError(500, "Something went wrong while uploading the about us")

    }


    return res.status(200).json(new ApiResponse(200, createabout, "about us upload succssfully"))
})


const getallAbout = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, adminId } = req.query;
    const filter = {};
    if (adminId) {
        filter.adminId = adminId;
    }
    const Abouts = await About.find(filter)
        .skip((page - 1) * limit) 
        .limit(parseInt(limit)) 
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }); 
    if (!Abouts || Abouts.length === 0) {
        throw new ApiError(404, "No Abouts found");
    }
    return res.status(200).json(new ApiResponse(200, Abouts, "All uploaded Abouts fetched successfully"));
});
// getsingle About 
const getSingleAbout = asyncHandler(async (req, res) => {
    const about_id = req.params.id;
    const about = await About.findById(about_id).select("-__v");

    if (!about) {
        throw new ApiError(404, "About not found");
    }
    return res.status(200).json(new ApiResponse(200, about, "About us data fetched successfully"));
});
// update details
const updateAboutdetails = asyncHandler(async (req, res) => {
    const About_id = req.params.id;
    const { title ,description} = req.body
    if (!(title ,description)) {
        throw new ApiError(400, "title is Required")
    }
    const AboutImageLocalPath = req.file?.path
    if (!AboutImageLocalPath) {
        throw new ApiError(400, "image file is missing")
    }
    const AboutImage = await uploadOnCloudinary(AboutImageLocalPath)
    if (!AboutImage.url) {
        throw new ApiError(400, "Error while uploading image")
    }

    const about = await About.findByIdAndUpdate(About_id, {
        $set: {
            title,
            description,description,
            AboutImage: AboutImage.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, about, "About us Details Update Succfully"))
});

// delete About
const deleteAbout = asyncHandler(async (req, res) => {
    const about_id = req.params.id;
    const about = await About.findByIdAndDelete(about_id);

    if (!about) {
        throw new ApiError(404, "About not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "About us data delete successfully"));
});

export { uploadAbout, getallAbout, deleteAbout, getSingleAbout, updateAboutdetails,}
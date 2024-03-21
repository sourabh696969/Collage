import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Gellery } from "../models/gallery_models.js";
import mongoose from "mongoose";


const uploadgellery = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (
        [title].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "title isrequired")
    }
    const GelleryImageLocalPath = req.files?.GelleryImage[0]?.path

    if (!GelleryImageLocalPath) {
        throw new ApiError(400, "galler image is required")
    }

    const GelleryImage = await uploadOnCloudinary(GelleryImageLocalPath)

    const gallery = await Gellery.create({
        title: title.toLowerCase(),
        GelleryImage: GelleryImage.url,
    })

    const createImage = await Gellery.findById(gallery._id)

    if (!createImage) {
        throw new ApiError(500, "Something went wrong while uploading the Image")

    }


    return res.status(200).json(new ApiResponse(200, createImage, "Image upload succssfully"))
})


const getallgellery = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, adminId } = req.query;

    // Constructing the query object based on the parameters
    const filter = {}; // Initialize an empty filter object

    if (adminId) {
        filter.adminId = adminId;
    }
    const gellerys = await Gellery.find(filter)
        .skip((page - 1) * limit) // Skip records based on pagination
        .limit(parseInt(limit)) // Limit the number of records per page
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }); // Sort the records based on sortBy and sortType

    if (!gellerys || gellerys.length === 0) {
        throw new ApiError(404, "No gellerys found");
    }
    return res.status(200).json(new ApiResponse(200, gellerys, "All uploaded gellerys fetched successfully"));
});
// getsingle gellery 
const getSinglegellery = asyncHandler(async (req, res) => {
    const gellery_id = req.params.id;
    const gellery = await Gellery.findById(gellery_id);

    if (!gellery) {
        throw new ApiError(404, "gellery not found");
    }
    return res.status(200).json(new ApiResponse(200, gellery, "gellery fetched successfully"));
});
// update details
const updategellerydetails = asyncHandler(async (req, res) => {
    const gellery_id = req.params.id;
    const { title } = req.body
    if (!title) {
        throw new ApiError(400, "title is Required")
    }
    const createImageLocalPath = req.file?.path
    if (!createImageLocalPath) {
        throw new ApiError(400, "image file is missing")
    }
    const createImage = await uploadOnCloudinary(createImageLocalPath)
    if (!createImage.url) {
        throw new ApiError(400, "Error while uploading image")
    }

    const gellery = await Gellery.findByIdAndUpdate(gellery_id, {
        $set: {
            title,
            createImage: createImage.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, gellery, "gellery Details Update Succfully"))
});

// delete gellery
const deletegellery = asyncHandler(async (req, res) => {
    const gellery_id = req.params.id;
    const gellery = await Gellery.findByIdAndDelete(gellery_id);

    if (!gellery) {
        throw new ApiError(404, "gellery not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "gellery delete successfully"));
});

export { uploadgellery, getallgellery, deletegellery, getSinglegellery, updategellerydetails,}
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Press } from "../models/press_release_models.js";


const uploadpress = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (
        [title].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "title is required")
    }
    const PressImageLocalPath = req.files?.PressImage[0]?.path

    if (!PressImageLocalPath) {
        throw new ApiError(400, "galler image is required")
    }

    const PressImage = await uploadOnCloudinary(PressImageLocalPath)

    const press = await Press.create({
        title: title.toLowerCase(),
        PressImage: PressImage.url,
    })

    const createPress = await Press.findById(press._id).select("-__v")

    if (!createPress) {
        throw new ApiError(500, "Something went wrong while uploading the press realse")

    }


    return res.status(200).json(new ApiResponse(200, createPress, "press realse upload succssfully"))
})


const getallpress = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, pressId } = req.query;

    // Constructing the query object based on the parameters
    const filter = {}; // Initialize an empty filter object

    if (pressId) {
        filter.pressId = pressId;
    }
    const presss = await Press.find(filter)
        .skip((page - 1) * limit) // Skip records based on pagination
        .limit(parseInt(limit)) // Limit the number of records per page
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }).select("-__v"); // Sort the records based on sortBy and sortType

    if (!presss || presss.length === 0) {
        throw new ApiError(404, "No presss found");
    }
    return res.status(200).json(new ApiResponse(200, presss, "All uploaded presss fetched successfully"));
});
// getsingle press 
const getSinglepress = asyncHandler(async (req, res) => {
    const press_id = req.params.id;
    const press = await Press.findById(press_id).select("-__v");

    if (!press) {
        throw new ApiError(404, "press not found");
    }
    return res.status(200).json(new ApiResponse(200, press, "press fetched successfully"));
});
// update details
const updatepressdetails = asyncHandler(async (req, res) => {
    const press_id = req.params.id;
    const { title } = req.body
    if (!title) {
        throw new ApiError(400, "title is Required")
    }
    const PressImageLocalPath = req.file?.path
    if (!PressImageLocalPath) {
        throw new ApiError(400, "image file is missing")
    }
    const PressImage = await uploadOnCloudinary(PressImageLocalPath)
    if (!PressImage.url) {
        throw new ApiError(400, "Error while uploading image")
    }

    const press = await Press.findByIdAndUpdate(press_id, {
        $set: {
            title,
            PressImage: PressImage.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, press, "press Details Update Succfully"))
});

// delete press
const deletepress = asyncHandler(async (req, res) => {
    const press_id = req.params.id;
    const press = await Press.findByIdAndDelete(press_id);

    if (!press) {
        throw new ApiError(404, "press not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "press delete successfully"));
});

export { uploadpress, getallpress, deletepress, getSinglepress, updatepressdetails, }
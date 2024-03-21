import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video_models.js";
import { Admin } from "../models/admin_models.js";
import mongoose from "mongoose";


const uploadVideo = asyncHandler(async (req, res) => {
    const { title, desription } = req.body
    if (
        [title, desription].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thambail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const videoFilesLocalPath = req.files?.videoFiles[0]?.path

    if (!videoFilesLocalPath) {
        throw new ApiError(400, "videoFiles is required")
    }

    const videoFiles = await uploadOnCloudinary(videoFilesLocalPath)
    const video = await Video.create({
        title: title.toLowerCase(),
        desription: desription || "",
        thumbnail: thumbnail.url,
        videoFiles: videoFiles.url,
    })

    const createVideo = await Video.findById(video._id)

    if (!createVideo) {
        throw new ApiError(500, "Something went wrong while uploading the video")

    }


    return res.status(200).json(new ApiResponse(200, createVideo, "video upload succssfully"))
})


const getallVideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, adminId } = req.query;

    // Constructing the query object based on the parameters
    const filter = {}; // Initialize an empty filter object

    if (adminId) {
        filter.adminId = adminId;
    }
    const videos = await Video.find(filter)
        .skip((page - 1) * limit) // Skip records based on pagination
        .limit(parseInt(limit)) // Limit the number of records per page
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }); // Sort the records based on sortBy and sortType

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found");
    }
    return res.status(200).json(new ApiResponse(200, videos, "All uploaded videos fetched successfully"));
});
// getsingle video 
const getSinglevideo = asyncHandler(async (req, res) => {
    const video_id = req.params.id;
    const video = await Video.findById(video_id);

    if (!video) {
        throw new ApiError(404, "video not found");
    }
    return res.status(200).json(new ApiResponse(200, video, "video fetched successfully"));
});
// update details
const updatevideodetails = asyncHandler(async (req, res) => {
    const { title, desription } = req.body
    if (!(title || desription)) {
        throw new ApiError(400, "All Fileds are Required")
    }
    const video_id = req.params.id;
    const video = await Video.findByIdAndUpdate(video_id, {
        $set: {
            title,
            desription
        }
    }, { new: true }).select("-videoFiles -thumbnail -createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, video, "Video Details Update Succfully"))
});

// delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const video_id = req.params.id;
    const video = await Video.findByIdAndDelete(video_id);

    if (!video) {
        throw new ApiError(404, "video not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "Video delete successfully"));
});
// update thamnail
const thumbnailupdate = asyncHandler(async (req, res) => {
    const video_id = req.params.id;
    const thumbnailLocalPath = req.file?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    await Video.findByIdAndUpdate(video_id, {
        $set: {
            thumbnail: thumbnail.url
        }
    }, { new: true })
        .select(" -desription -title -videoFiles  -createdAt -updatedAt")
    return res.status(200).json(new ApiResponse(200, null, "thumbnail update succssfully"))
})
export { uploadVideo, getallVideo, deleteVideo, getSinglevideo, updatevideodetails,thumbnailupdate }
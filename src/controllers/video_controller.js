import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video_models.js";
import { User } from "../models/user_models.js";
import mongoose from "mongoose";


const uploadVideo = asyncHandler(async (req, res) => {
    const { title, desription } = req.body
    // Get the user ID from the request
    const UserId = req.user._id;

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
    const users = await User.findById(UserId)
    const video = await Video.create({
        title: title.toLowerCase(),
        desription: desription || "",
        thumbnail: thumbnail.url,
        videoFiles: videoFiles.url,
        videoOwner: {
            _id: users._id,
            userName: users.userName
        },
    })

    const createVideo = await Video.findById(video._id)

    if (!createVideo) {
        throw new ApiError(500, "Something went wrong while uploading the video")

    }


    return res.status(200).json(new ApiResponse(200, createVideo, "video upload succssfully"))
})

// const getUploadVideo = asyncHandler(async(req, res) => {
//     const user = await User.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(req.user._id)
//             }
//         },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "owner",
//                 foreignField: "_id",
//                 as: "owner"
//             }
//         },
//         {
//             $addFields: {
//                 userName: {
//                     $first: "$owner"
//                 }
//             }
//         },
//         {
//             $project: {
//                 title: 1,
//                 desription: 1,
//                 thumbnail: 1,
//                 videoFiles: 1,
//                 userName: 1
//             }
//         }
//     ])
//     // if (!user?.lengh) {
//     //     throw new ApiError(404, "user does not exist")
//     // }
//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             user[0],
//             "video  fetched successfully"
//         )
//     )

// })

// getall video

// const getallVideo = asyncHandler(async (_, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     // Retrieve all videos from the database
//     const videos = await Video.find();

//     if (!videos || videos.length === 0) {
//         // If no videos are found, return a 404 error
//         throw new ApiError(404, "No videos found");
//     }

//     // Return the videos in the response
//     return res.status(200).json(new ApiResponse(200, videos, "All uploaded videos fetched successfully"));
// });




const getallVideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Constructing the query object based on the parameters
    const filter = {}; // Initialize an empty filter object

    if (userId) {
        filter.userId = userId;
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


export { uploadVideo, getallVideo }
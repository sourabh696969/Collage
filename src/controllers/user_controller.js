import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        // console.log("access token",accessToken)
        const refreshToken = user.generateRefreshToken()
        console.log("refresh token", refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { lastName, email, userName, password } = req.body
    //console.log("email: ", email);

    if (
        [email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create({
        lastName: lastName || "",
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, userName, password } = req.body
    if (!userName && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")

    // }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    console.log(loggedInUser)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    // user: loggedInUser, 
                    accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

// logout user
const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id, {
        $unset: {
            refreshToken: 1
        }
    },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, "User logged Out Succssfully"))
})
// refreshToken
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized accessToken")
    }
    try {
        const decodedToken = Jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "invaild refreshToken")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired || used")

        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { NewaccessToken, NewrefreshToken } = await generateAccessAndRefereshTokens(user._id)
        return res.status(200).cookie("accessToken", NewaccessToken, options)
            .cookie("refreshToken", NewrefreshToken, options).json(
                new ApiResponse(200, { NewaccessToken, NewrefreshToken }, "Access Token Refresh Succfully")
            )
    } catch (error) {
        throw new ApiError(401, error?.mesaage || "invaild refreshToken")
    }

})

// changecurrent password
const ChangeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await  user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "invaild Password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(
        new ApiResponse(200, {}, "password update succfully")
    )
})

// get corrent user 
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "current User fetched succufully!!"))
})
// update user details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { userName, lastName, email } = req.body
    if (!(userName || lastName || email)) {
        throw new ApiError(400, "All Fileds are Required")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            userName,
            lastName,
            email
        }
    }, { new: true }).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Account Details Update Succfully"))
})

// update avartar
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url
        }
    }, { new: true }).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "user avatar update succssfully"))
})
// coverImage
const updatecoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "user coverImage update succssfully"))
})

// get user channel profile
const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {userName} = req.params

    if (!userName?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                lastName: 1,
                userName: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

// get watch histroy
// const getWatchHistroy = asyncHandler(async () => {
//     const user = await User.aggregate([
//         {
//         $match: {
//             _id: new mongoose.Types.ObjectId(req.user._id)
//         }},
//         {$lookup: {
//             from: "videos",
//             localField: "watchHistory",
//             foreignField: "_id",
//             as: "watchHistory",
//             pipeline: [
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "owner",
//                         foreignField: "_id",
//                         as: "onwer",
//                         pipeline: [
//                             {
//                                 $project: {
//                                     userName: 1,
//                                     lastName: 1,
//                                     avatar: 1,
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $addFields:{
//                         owner:{
//                             $first:"$owner"
//                         }
//                     }
//                 }
//             ]
//         }}
//     ])
//     return res.status(200).json(
//         new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully")
//     )
// })
const getWatchHistroy = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, ChangeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updatecoverImage, getUserChannelProfile, getWatchHistroy }
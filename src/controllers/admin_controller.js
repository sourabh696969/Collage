import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin_models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId)
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()
        admin.refreshToken = refreshToken
        await admin.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const adminregistration = asyncHandler(async (req, res) => {
    const { email, Name, password } = req.body
    if (
        [email, Name, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedAdmin = await Admin.findOne({
        $or: [{ Name }, { email }]
    })
    if (existedAdmin) {
        throw new ApiError(409, "admin with email or adminname already exists")
    }

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    const admin = await Admin.create({
        avatar: avatar.url,
        email,
        password,
        Name: Name.toLowerCase()
    })

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken -watchHistoy"
    )
    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the Admin")
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin registered Successfully")
    )

})


const loginAdmin = asyncHandler(async (req, res) => {
    const { email, Name, password } = req.body
    if (!Name && !email) {
        throw new ApiError(400, "adminname or email is required")
    }
    const admin = await Admin.findOne({
        $or: [{ Name }, { email }]
    })

    if (!admin) {
        throw new ApiError(404, "admin does not exist")
    }

    const isPasswordValid = await admin.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid admin credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(admin._id)

    const loggedInadmin = await Admin.findById(admin._id).select("-password -refreshToken")
    console.log(loggedInadmin)
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
                    // admin: loggedInadmin, 
                    accessToken, refreshToken
                },
                "admin logged In Successfully"
            )
        )

})

// // logout admin
const logoutadmin = asyncHandler(async (req, res) => {
    Admin.findByIdAndUpdate(
        req.admin._id, {
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
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "admin logged Out Succssfully"))
})
// // refreshToken
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
        const admin = await Admin.findById(decodedToken?._id)
        if (!admin) {
            throw new ApiError(401, "invaild refreshToken")
        }
        if (incomingRefreshToken !== admin?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired || used")

        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { NewaccessToken, NewrefreshToken } = await generateAccessAndRefereshTokens(admin._id)
        return res.status(200).cookie("accessToken", NewaccessToken, options)
            .cookie("refreshToken", NewrefreshToken, options).json(
                new ApiResponse(200, { NewaccessToken, NewrefreshToken }, "Access Token Refresh Succfully")
            )
    } catch (error) {
        throw new ApiError(401, error?.mesaage || "invaild refreshToken")
    }

})

// // changecurrent password
const ChangeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const admin = await Admin.findById(req.admin?._id)
    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "invaild Password")
    }
    admin.password = newPassword
    await admin.save({ validateBeforeSave: false })
    return res.status(200).json(
        new ApiResponse(200, {}, "password update succfully")
    )
})


// // get corrent admin 
const getCurrentadmin = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.admin, "current admin fetched succufully!!"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { Name, email } = req.body
    if (!(Name || email)) {
        throw new ApiError(400, "All Fileds are Required")
    }

    const admin = await Admin.findByIdAndUpdate(req.admin._id, {
        $set: {
            Name,
            email
        }
    }, { new: true }).select("-password -watchHistoy -createdAt -updatedAt")
    return res.status(200).json(new ApiResponse(200, admin, "Account Details Update Succfully"))
})


const deleteadmin = asyncHandler(async (req, res) => {
    const deletedadmin = await Admin.findByIdAndDelete(req.admin.id);
    if (!deletedadmin) {
        throw new ApiError(404, "Admin not found");
    }

    // Respond with success message
    return res.status(200).json(new ApiResponse(200, null, "Admin deleted successfully"));
});


// // update avartar
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    await Admin.findByIdAndUpdate(req.admin._id, {
        $set: {
            avatar: avatar.url
        }
    }, { new: true })
    // .select("-password -lastName -email -coverImage -watchHistoy -createdAt -updatedAt -refreshToken")
    return res.status(200).json(new ApiResponse(200, null, "admin avatar update succssfully"))
})


export {
    adminregistration, loginAdmin, logoutadmin, refreshAccessToken, ChangeCurrentPassword, getCurrentadmin, updateAccountDetails, updateAvatar, deleteadmin
}
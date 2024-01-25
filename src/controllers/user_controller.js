import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        // console.log("access token",accessToken)
        const refreshToken = user.generateRefreshToken()
        console.log("refresh token",refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {accessToken, refreshToken}
        console.log(accessToken)

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


// const loginUser = asyncHandler(async (req, res) => {
//     // req from body
//     const { email, userName, password } = req.body
//     if (!(email || userName)) {
//         throw new ApiError(400, "username or email required")
//     }
//     // find user in data base
//     const user = await User.findOne({ $or: [{ userName }, { email }] })

//     // check is exist or not in data base
//     if (!user) {
//         throw new ApiError(400, "user dost not exits")
//     }
//     // check password
//     const ispasswordVaild = await user.isPasswordCorrect(password)
//     if (!ispasswordVaild) {
//         throw new ApiError(401, "password incorrect")
//     }
//     // login user 
//     const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
//     const options = {
//         httpOnly: true,
//         secure: true
//     }
//     return res.status(200).cookie("accessToken", accessToken).cookie("refreshToken", refreshToken).json(
//         new ApiResponse(
//             200,
//             {
//                 user: loggedInUser,
//                 accessToken,
//                 refreshToken
//             },
//             "user logged in successfully"
//         )
//     )
// })

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, userName, password} = req.body
    if (!userName && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{userName}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

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


export { registerUser, loginUser, logoutUser }
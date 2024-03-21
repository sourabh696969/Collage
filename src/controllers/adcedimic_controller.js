import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Acedamic } from "../models/acedamic_models.js";
const uploadacedamic = asyncHandler(async (req, res) => {
    const { title , description  } = req.body;
    if (
        [title,description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "title is required")
    }
    const ImageLocalPath = req.files?.Image[0]?.path

    if (!ImageLocalPath) {
        throw new ApiError(400, "galler Image is required")
    }

    const Image = await uploadOnCloudinary(ImageLocalPath)

    const acedamic = await Acedamic.create({
        title: title.toLowerCase(),
        description:description,
        Image: Image.url,
    })

    const createacedamic = await Acedamic.findById(acedamic._id).select("-__v");

    if (!createacedamic) {
        throw new ApiError(500, "Something went wrong while uploading the acedamic")

    }


    return res.status(200).json(new ApiResponse(200, createacedamic, "acedamic upload succssfully"))
})


const getallacedamic = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, acedamicId } = req.query;
    const filter = {};
    if (acedamicId) {
        filter.acedamicId = acedamicId;
    }
    const acedamics = await Acedamic.find(filter)
        .skip((page - 1) * limit) 
        .limit(parseInt(limit)) 
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }); 
    if (!acedamics || acedamics.length === 0) {
        throw new ApiError(404, "No acedamics found");
    }
    return res.status(200).json(new ApiResponse(200, acedamics, "All uploaded acedamics fetched successfully"));
});
// getsingle acedamic 
const getSingleacedamic = asyncHandler(async (req, res) => {
    const acedamic_id = req.params.id;
    const acedamic = await Acedamic.findById(acedamic_id).select("-__v");

    if (!acedamic) {
        throw new ApiError(404, "acedamic not found");
    }
    return res.status(200).json(new ApiResponse(200, acedamic, "acedamic us data fetched successfully"));
});
// update details
const updateacedamicdetails = asyncHandler(async (req, res) => {
    const acedamic_id = req.params.id;
    const { title ,description} = req.body
    if (!(title ,description)) {
        throw new ApiError(400, "title is Required")
    }
    const ImageLocalPath = req.file?.path
    if (!ImageLocalPath) {
        throw new ApiError(400, "Image file is missing")
    }
    const Image = await uploadOnCloudinary(ImageLocalPath)
    if (!Image.url) {
        throw new ApiError(400, "Error while uploading Image")
    }

    const acedamic = await Acedamic.findByIdAndUpdate(acedamic_id, {
        $set: {
            title,
            description,
            Image:Image.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, acedamic, "acedamic Details Update Succfully"))
});

// delete acedamic
const deleteacedamic = asyncHandler(async (req, res) => {
    const acedamic_id = req.params.id;
    const acedamic = await Acedamic.findByIdAndDelete(acedamic_id);

    if (!acedamic) {
        throw new ApiError(404, "acedamic not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "acedamic data delete successfully"));
});

export { uploadacedamic, getallacedamic, deleteacedamic, getSingleacedamic, updateacedamicdetails,}
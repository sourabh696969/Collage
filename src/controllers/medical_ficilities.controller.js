import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { MedicalFicilities } from "../models/medical_ficilities_models.js";
const uploadmedicalFicilities = asyncHandler(async (req, res) => {
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

    const medicalFicilities = await MedicalFicilities.create({
        title: title.toLowerCase(),
        description:description,
        Image: Image.url,
    })

    const createmedicalFicilities = await MedicalFicilities.findById(medicalFicilities._id).select("-__v");

    if (!createmedicalFicilities) {
        throw new ApiError(500, "Something went wrong while uploading the medicalFicilities")

    }


    return res.status(200).json(new ApiResponse(200, createmedicalFicilities, "medicalFicilities upload succssfully"))
})


const getallmedicalFicilities = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, medicalFicilitiesId } = req.query;
    const filter = {};
    if (medicalFicilitiesId) {
        filter.medicalFicilitiesId = medicalFicilitiesId;
    }
    const medicalFicilitiess = await MedicalFicilities.find(filter)
        .skip((page - 1) * limit) 
        .limit(parseInt(limit)) 
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }); 
    if (!medicalFicilitiess || medicalFicilitiess.length === 0) {
        throw new ApiError(404, "No medicalFicilitiess found");
    }
    return res.status(200).json(new ApiResponse(200, medicalFicilitiess, "All uploaded medicalFicilitiess fetched successfully"));
});
// getsingle medicalFicilities 
const getSinglemedicalFicilities = asyncHandler(async (req, res) => {
    const medicalFicilities_id = req.params.id;
    const medicalFicilities = await MedicalFicilities.findById(medicalFicilities_id).select("-__v");

    if (!medicalFicilities) {
        throw new ApiError(404, "medicalFicilities not found");
    }
    return res.status(200).json(new ApiResponse(200, medicalFicilities, "medicalFicilities  data fetched successfully"));
});
// update details
const updatemedicalFicilitiesdetails = asyncHandler(async (req, res) => {
    const medicalFicilities_id = req.params.id;
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

    const medicalFicilities = await MedicalFicilities.findByIdAndUpdate(medicalFicilities_id, {
        $set: {
            title,
            description,
            Image:Image.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, medicalFicilities, "medicalFicilities Details Update Succfully"))
});

// delete medicalFicilities
const deletemedicalFicilities = asyncHandler(async (req, res) => {
    const medicalFicilities_id = req.params.id;
    const medicalFicilities = await MedicalFicilities.findByIdAndDelete(medicalFicilities_id);

    if (!medicalFicilities) {
        throw new ApiError(404, "medicalFicilities not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "medicalFicilities data delete successfully"));
});

export { uploadmedicalFicilities, getallmedicalFicilities, deletemedicalFicilities, getSinglemedicalFicilities, updatemedicalFicilitiesdetails,}
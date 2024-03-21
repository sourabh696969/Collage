import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Ficilities } from "../models/Facilities_models.js";

const uploadficilities = asyncHandler(async (req, res) => {
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

    const ficilities = await Ficilities.create({
        title: title.toLowerCase(),
        description:description,
        Image: Image.url,
    })

    const createficilities = await Ficilities.findById(ficilities._id).select("-__v");

    if (!createficilities) {
        throw new ApiError(500, "Something went wrong while uploading the ficilities")

    }


    return res.status(200).json(new ApiResponse(200, createficilities, "ficilities upload succssfully"))
})


const getallficilities = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, ficilitiesId } = req.query;
    const filter = {};
    if (ficilitiesId) {
        filter.ficilitiesId = ficilitiesId;
    }
    const ficilitiess = await Ficilities.find(filter)
        .skip((page - 1) * limit) 
        .limit(parseInt(limit)) 
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }); 
    if (!ficilitiess || ficilitiess.length === 0) {
        throw new ApiError(404, "No ficilitiess found");
    }
    return res.status(200).json(new ApiResponse(200, ficilitiess, "All uploaded ficilitiess fetched successfully"));
});
// getsingle ficilities 
const getSingleficilities = asyncHandler(async (req, res) => {
    const ficilities_id = req.params.id;
    const ficilities = await Ficilities.findById(ficilities_id).select("-__v");

    if (!ficilities) {
        throw new ApiError(404, "ficilities not found");
    }
    return res.status(200).json(new ApiResponse(200, ficilities, "ficilities us data fetched successfully"));
});
// update details
const updateficilitiesdetails = asyncHandler(async (req, res) => {
    const ficilities_id = req.params.id;
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

    const ficilities = await Ficilities.findByIdAndUpdate(ficilities_id, {
        $set: {
            title,
            description,
            Image:Image.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, ficilities, "ficilities Details Update Succfully"))
});

// delete ficilities
const deleteficilities = asyncHandler(async (req, res) => {
    const ficilities_id = req.params.id;
    const ficilities = await Ficilities.findByIdAndDelete(ficilities_id);

    if (!ficilities) {
        throw new ApiError(404, "ficilities not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "ficilities data delete successfully"));
});

export { uploadficilities, getallficilities, deleteficilities, getSingleficilities, updateficilitiesdetails,}
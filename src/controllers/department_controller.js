import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import  {Department} from  '../models/departments_models.js'
const uploaddepartment = asyncHandler(async (req, res) => {
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

    const department = await Department.create({
        title: title.toLowerCase(),
        description:description,
        Image: Image.url,
    })

    const createdepartment = await Department.findById(department._id).select("-__v");

    if (!createdepartment) {
        throw new ApiError(500, "Something went wrong while uploading the department")

    }


    return res.status(200).json(new ApiResponse(200, createdepartment, "department upload succssfully"))
})


const getalldepartment = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, departmentId } = req.query;
    const filter = {};
    if (departmentId) {
        filter.departmentId = departmentId;
    }
    const departments = await Department.find(filter)
        .skip((page - 1) * limit) 
        .limit(parseInt(limit)) 
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }).select("-__v"); 
    if (!departments || departments.length === 0) {
        throw new ApiError(404, "No departments found");
    }
    return res.status(200).json(new ApiResponse(200, departments, "All uploaded departments fetched successfully"));
});
// getsingle department 
const getSingledepartment = asyncHandler(async (req, res) => {
    const department_id = req.params.id;
    const department = await Department.findById(department_id).select("-__v");

    if (!department) {
        throw new ApiError(404, "department not found");
    }
    return res.status(200).json(new ApiResponse(200, department, "department us data fetched successfully"));
});
// update details
const updatedepartmentdetails = asyncHandler(async (req, res) => {
    const department_id = req.params.id;
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

    const department = await Department.findByIdAndUpdate(department_id, {
        $set: {
            title,
            description,
            Image:Image.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, department, "department Details Update Succfully"))
});

// delete department
const deletedepartment = asyncHandler(async (req, res) => {
    const department_id = req.params.id;
    const department = await Department.findByIdAndDelete(department_id);

    if (!department) {
        throw new ApiError(404, "department not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "department data delete successfully"));
});

export { uploaddepartment, getalldepartment, deletedepartment, getSingledepartment, updatedepartmentdetails,}
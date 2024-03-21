import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PdfuploadOnCloudinary } from "../utils/cloudinary.js";
import { Student } from "../models/student_models.js";
import mongoose from "mongoose";


const uploadpdf = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (
        [title].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "title isrequired")
    }
    const pdfLocalPath = req.files?.Pdf[0]?.path

    if (!pdfLocalPath) {
        throw new ApiError(400, "Pdf is required")
    }
    const Pdf = await PdfuploadOnCloudinary(pdfLocalPath)

    const student = await Student.create({
        title: title.toLowerCase(),
        Pdf: Pdf.url,
    })
    const createStudent = await Student.findById(student._id)
    if (!createStudent) {
        throw new ApiError(500, "Something went wrong while uploading the Pdf")
    }
    return res.status(200).json(new ApiResponse(200, createStudent, "Pdf upload succssfully"))
})


const getallpdf = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, studentId } = req.query;

    const filter = {};

    if (studentId) {
        filter.studentId = studentId;
    }
    const student = await Student.find(filter)
        .skip((page - 1) * limit) // Skip records based on pagination
        .limit(parseInt(limit)) // Limit the number of records per page
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }); // Sort the records based on sortBy and sortType

    if (!student || student.length === 0) {
        throw new ApiError(404, "No pdfs found");
    }
    return res.status(200).json(new ApiResponse(200, student, "All uploaded pdfs fetched successfully"));
});
// getsingle pdf 
const getSinglepdf = asyncHandler(async (req, res) => {
    const student_Id = req.params.id;
    const student = await Student.findById(student_Id);

    if (!student) {
        throw new ApiError(404, "pdf not found");
    }
    return res.status(200).json(new ApiResponse(200, student, "pdf fetched successfully"));
});
// update details
const updatepdfdetails = asyncHandler(async (req, res) => {
    const student_Id = req.params.id;
    const { title } = req.body
    if (!title) {
        throw new ApiError(400, "title is Required")
    }
    const pdfLocalPath = req.file?.path
    if (!pdfLocalPath) {
        throw new ApiError(400, "image file is missing")
    }
    const Pdf = await PdfuploadOnCloudinary(pdfLocalPath)
    if (!Pdf.url) {
        throw new ApiError(400, "Error while uploading image")
    }

    const student = await Student.findByIdAndUpdate(student_Id, {
        $set: {
            title,
            Pdf: Pdf.url
        }
    }, { new: true }).select("-createdAt -updatedAt -__v")
    return res.status(200).json(new ApiResponse(200, student, "pdf Details Update Succfully"))
});

// delete pdf
const deletepdf = asyncHandler(async (req, res) => {
    const student_Id = req.params.id;
    const student = await Student.findByIdAndDelete(student_Id);

    if (!student) {
        throw new ApiError(404, "pdf not found to delete");
    }

    return res.status(200).json(new ApiResponse(200, null, "pdf delete successfully"));
});

export { uploadpdf, getallpdf, deletepdf, getSinglepdf, updatepdfdetails,}
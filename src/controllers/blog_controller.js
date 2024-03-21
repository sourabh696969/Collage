import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Blog } from "../models/blog_models.js";

// create blog
const uploadBlog = asyncHandler(async (req, res) => {
    const { title, content, slugUrl, MetaTitle, Metakeyword, MetaDescription } = req.body
    if (
        [title, content].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "title and content required")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thambail is required")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const blog = await Blog.create({
        title: title.toLowerCase(),
        content: content || "",
        thumbnail: thumbnail.url,
        slugUrl: slugUrl,
        MetaTitle: MetaTitle,
        Metakeyword: Metakeyword,
        MetaDescription: MetaDescription,
    })
    const createBlog = await Blog.findById(blog._id).select("-__v")
    if (!createBlog) {
        throw new ApiError(500, "Something went wrong while uploading the blog")
    }


    return res.status(200).json(new ApiResponse(200, createBlog, "blog upload succssfully"))
})
// getall blogs
const getallblogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, blogId } = req.query;
    const filter = {}; 

    if (blogId) {
        filter.blogId = blogId;
    }
    const blogs = await Blog.find(filter)
        .skip((page - 1) * limit) 
        .limit(parseInt(limit)) 
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 }).select("-__v"); 

    if (!blogs || blogs.length === 0) {
        throw new ApiError(404, "No blogs found");
    }
    return res.status(200).json(new ApiResponse(200, blogs, "All Blogs fetched successfully"));
});

// getsingle blogs
const getSingleBlogs = asyncHandler(async (req, res) => {
    const blogId = req.params.id; 
    const blogs = await Blog.findById(blogId).select("-__v");

    if (!blogs) {
        throw new ApiError(404, "blogs not found");
    }

    return res.status(200).json(new ApiResponse(200, blogs, "blogs fetched successfully"));
});
// delete blog
const deleteBlogs = asyncHandler(async (req, res) => {
    const blogId = req.params.id; 
    const blogs = await Blog.findByIdAndDelete(blogId);

    if (!blogs) {
        throw new ApiError(404, "blogs not found to delete");
    }

    return res.status(200).json(new ApiResponse(200,null, "blogs delete successfully"));
});
// update blog
const   updateBlogById = asyncHandler(async (req, res) => {
    const {title,content,slugUrl,MetaTitle,Metakeyword,MetaDescription} = req.body
    console.log(req.body)
    let blogIdToUpdate;
    if (req.params.id) {
        blogIdToUpdate = req.params.id;
    } else if (req.blog && req.blog._id) {
        blogIdToUpdate = req.blog._id;
    } else {
        throw new ApiError(401, "Unauthorized: User not authenticated");
    }
    if (req.blog && req.blog._id !== blogIdToUpdate) {
        throw new ApiError(403, "Forbidden: You are not authorized to update this user's account");
    }
    const thumbnailLocalPath = req.file?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thambnail file is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading Thambnail")
    }
    const updateObject = {};
    if (title) updateObject.title = title;
    if (content) updateObject.content = content;
    if (slugUrl) updateObject.slugUrl = slugUrl;
    if (MetaTitle) updateObject.MetaTitle = MetaTitle;
    if (Metakeyword) updateObject.Metakeyword = Metakeyword;
    if (MetaDescription) updateObject.MetaDescription = MetaDescription;
    if (thumbnail) updateObject.thumbnail = thumbnail.url;
    console.log(updateObject)
    const updatedblog = await Blog.findByIdAndUpdate(
        blogIdToUpdate,
        { $set: updateObject },
        { new: true },
    ).select("-__v")
          if (!updatedblog) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, updatedblog, "blog updated successfully"));
});



export { uploadBlog, getallblogs,getSingleBlogs,deleteBlogs,updateBlogById }
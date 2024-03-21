import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema({
    thumbnail: {
        type: String,
        // required: true
    },
    title: {
        type: String,
        // required : true
    },
    content: {
        type: String,
        // required : true
    },
    slugUrl: {
        type: String,
    },
    MetaTitle: {
        type: String,
    },
    Metakeyword: {
        type: String,
    },
    MetaDescription: {
        type: String,
    },
}, { timestamps: true })

export const Blog = mongoose.model("Blog", blogSchema)
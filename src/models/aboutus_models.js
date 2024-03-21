import mongoose, { Schema } from "mongoose";

const aboutSchema = new Schema(
    {
        AboutImage: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
    }, { timestamps: true })

export const About = mongoose.model("About", aboutSchema)
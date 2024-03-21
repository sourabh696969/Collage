import mongoose, { Schema } from "mongoose";

const ficilitiesSchema = new Schema(
    {
        Image: {
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
        }
    }, { timestamps: true })

export const Ficilities = mongoose.model("Ficilities", ficilitiesSchema)
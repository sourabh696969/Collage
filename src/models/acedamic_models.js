import mongoose, { Schema } from "mongoose";

const acedamicSchema = new Schema(
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

export const Acedamic = mongoose.model("Acedamic", acedamicSchema)
import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema(
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

export const Department = mongoose.model("Department", departmentSchema)
import mongoose, { Schema } from "mongoose";

const medicalFicilitiesSchema = new Schema(
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

export const MedicalFicilities = mongoose.model("MedicalFicilities", medicalFicilitiesSchema)
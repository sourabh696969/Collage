import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true, unique:true},
    number: { type: String, unique:true,required:true},
    // number: { type: String, unique:true},
}, { timestamps: true })


export const Contact = mongoose.model("Contact", contactSchema)
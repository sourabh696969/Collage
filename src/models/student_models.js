import mongoose ,{Schema} from "mongoose";

const studentSchema = new Schema(
    {
     Pdf:{
        type : String, 
        required : true
     },
     title:{
        type : String, 
        required : true
     },
},{timestamps:true})

export const Student =  mongoose.model("Student",studentSchema)
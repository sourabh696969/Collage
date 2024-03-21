import mongoose ,{Schema} from "mongoose";

const pressSchema = new Schema(
    {
     PressImage:{
        type : String, 
      //   required : true
     },
     title:{
        type : String, 
        required : true
     },
},{timestamps:true})

export const Press =  mongoose.model("Press",pressSchema)
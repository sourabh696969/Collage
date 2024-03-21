import mongoose ,{Schema} from "mongoose";

const gallerySchema = new Schema(
    {
     GelleryImage:{
        type : String, 
        required : true
     },
     title:{
        type : String, 
        required : true
     },
},{timestamps:true})

export const Gellery =  mongoose.model("Gellery",gallerySchema)
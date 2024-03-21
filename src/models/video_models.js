import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
     videoFiles:{
        type : String, 
        required : true
     },
     thumbnail:{
        type : String, 
        required : true
     },
     title:{
        type : String, 
        required : true
     },
     desription:{
        type : String, 
        required : true
     },
     duration:{
        type : Number, 
        required : false
     },
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)


export const Video =  mongoose.model("Video",videoSchema)
import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
     videoFiles:{
        type : String, //cloudinary
        required : true
     },
     thumbnail:{
        type : String, //cloudinary
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
     views:{
        type : Number, 
        default:0
     },
     ispublished:{
        type : Boolean, 
        default:true
     },
     userId:{
        type : Schema.Types.ObjectId,
        ref : "User"
     }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)


export const Video =  mongoose.model("Video",videoSchema)
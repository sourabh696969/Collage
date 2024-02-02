import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,//one who subscrib
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId,//one who subscribed
        ref: "User",
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)
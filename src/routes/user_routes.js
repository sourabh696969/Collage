import { Router } from "express";
import { ChangeCurrentPassword, getAllUser, getCurrentUser, getUserChannelProfile, getWatchHistroy, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updatecoverImage } from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/register").post(upload.fields(
    [
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]
), registerUser) //check

router.route("/login").post(loginUser)//check   
// secured routes
router.route("/logout").post(verifyJWT, logoutUser)//checked
router.route("/refreshToken").post(refreshAccessToken)//checked
router.route("/change-password").post(verifyJWT, ChangeCurrentPassword)//checked
router.route("/current-user").get(verifyJWT, getCurrentUser)//checked
router.route("/getalluser").get(verifyJWT, getAllUser)//checked
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)//checked
// images update
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)//checked
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"),updatecoverImage) //checked

router.route("/c/:userName").get(verifyJWT, getUserChannelProfile)//checked
router.route("/history").get(verifyJWT, getWatchHistroy)//checked

export default router;
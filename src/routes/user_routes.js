import { Router } from "express";
import { ChangeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistroy, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updatecoverImage } from "../controllers/user_controller.js";
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
router.route("/logout").post(verifyJWT, logoutUser)//check
router.route("/refreshToken").post(refreshAccessToken)//check
router.route("/change-password").post(verifyJWT, ChangeCurrentPassword)//check
router.route("/current-user").get(verifyJWT, getCurrentUser)//check
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
// images update
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/covar-image").patch(verifyJWT, upload.single("covarImage"),updatecoverImage)

router.route("/c/:userName").get(verifyJWT, getUserChannelProfile)//check
router.route("/history").get(verifyJWT, getWatchHistroy)//check

export default router;
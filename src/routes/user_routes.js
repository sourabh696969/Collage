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
), registerUser)

router.route("/login").post(loginUser)
// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, ChangeCurrentPassword)
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("/avatar"), updateAvatar)
router.route("/covar-image").patch(verifyJWT, upload.single("/covarImage"), updatecoverImage)
router.route("/c/:userName").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistroy)

export default router;
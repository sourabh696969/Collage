import { Router } from "express";
import {getallVideo, uploadVideo } from "../controllers/video_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/upload").post(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    }, {
        name: "videoFiles",
        maxCount: 1
    }
]), uploadVideo)
// router.route('/getUploadVideo').get(verifyJWT, getUploadVideo)
router.route('/getallVideo').get(verifyJWT,getallVideo )

export default router;
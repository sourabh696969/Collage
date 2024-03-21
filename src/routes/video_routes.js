import { Router } from "express";
import {getallVideo, uploadVideo,deleteVideo ,getSinglevideo,updatevideodetails,thumbnailupdate} from "../controllers/video_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadVideo").post(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    }, {
        name: "videoFiles",
        maxCount: 1
    }
]), uploadVideo)
router.route('/getallVideo').get(getallVideo )
router.route('/getallVideo/:id').get(getSinglevideo )
router.route('/deleteVideo/:id').delete(verifyJWT, deleteVideo)
router.route('/updatevideo/:id').put(verifyJWT, updatevideodetails)
router.route("/updatethambnail/:id").patch(verifyJWT, upload.single("thumbnail"),thumbnailupdate)

export default router;
import { Router } from "express";
import { uploadAbout, getallAbout, deleteAbout, getSingleAbout, updateAboutdetails, } from "../controllers/about_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadaboutus").post(verifyJWT, upload.fields([
    {
        name: "AboutImage",
        maxCount: 1
    }
]), uploadAbout)
router.route('/getaboutus').get(getallAbout)
router.route('/getaboutus/:id').get(getSingleAbout)
router.route('/deleteaboutus/:id').delete(verifyJWT, deleteAbout)
router.route('/updateaboutus/:id').put(verifyJWT, upload.single("AboutImage"), updateAboutdetails)

export default router;
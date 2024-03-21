import { Router } from "express";
import { uploadpress, getallpress, deletepress, getSinglepress, updatepressdetails, } from "../controllers/press_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadpressrealse").post(verifyJWT, upload.fields([
    {
        name: "PressImage",
        maxCount: 1
    }
]), uploadpress)
router.route('/getallpressrelase').get(getallpress)
router.route('/getSinglepress/:id').get(getSinglepress)
router.route('/deletepressimage/:id').delete(verifyJWT, deletepress)
router.route('/updatpressrealse/:id').put(verifyJWT, upload.single("PressImage"), updatepressdetails)

export default router;
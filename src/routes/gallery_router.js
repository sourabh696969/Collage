import { Router } from "express";
import { uploadgellery, getallgellery, deletegellery, getSinglegellery, updategellerydetails } from "../controllers/gallery_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadImage").post(verifyJWT, upload.fields([
    {
        name: "GelleryImage",
        maxCount: 1
    }
]), uploadgellery)
router.route('/getallimages').get(getallgellery)
router.route('/getallimage/:id').get(getSinglegellery)
router.route('/deleteimage/:id').delete(verifyJWT, deletegellery)
router.route('/updateimage/:id').put(verifyJWT, upload.single("GelleryImage"), updategellerydetails)

export default router;
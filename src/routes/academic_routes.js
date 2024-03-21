import { Router } from "express";
import {uploadacedamic, getallacedamic, deleteacedamic, getSingleacedamic, updateacedamicdetails, } from "../controllers/adcedimic_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadacedamic").post(verifyJWT, upload.fields([
    {
        name: "Image",
        maxCount: 1
    }
]), uploadacedamic)
router.route('/getacedamic').get(getallacedamic)
router.route('/getsingleacedamic/:id').get(getSingleacedamic)
router.route('/deleteacedamic/:id').delete(verifyJWT, deleteacedamic)
router.route('/updateacedamic/:id').put(verifyJWT, upload.single("Image"), updateacedamicdetails)

export default router;
import { Router } from "express";
import {uploadmedicalFicilities, getallmedicalFicilities, deletemedicalFicilities, getSinglemedicalFicilities, updatemedicalFicilitiesdetails, } from "../controllers/medical_ficilities.controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadmedicalficilities").post(verifyJWT, upload.fields([
    {
        name: "Image",
        maxCount: 1
    }
]), uploadmedicalFicilities)
router.route('/getallmedicalFicilities').get(getallmedicalFicilities)
router.route('/getSinglemedicalFicilities/:id').get(getSinglemedicalFicilities)
router.route('/deletemedicalFicilities/:id').delete(verifyJWT, deletemedicalFicilities)
router.route('/updatemedicalFicilitiesdetails/:id').put(verifyJWT, upload.single("Image"), updatemedicalFicilitiesdetails)

export default router;
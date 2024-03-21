import { Router } from "express";
import { uploadpdf, getallpdf, deletepdf, getSinglepdf, updatepdfdetails, } from "../controllers/student_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadpdf").post(verifyJWT, upload.single("Pdf"), uploadpdf)
router.route('/getallpdf').get(getallpdf)
router.route('/getSinglepdf/:id').get(getSinglepdf)
router.route('/deletepdf/:id').delete(verifyJWT, deletepdf)
router.route('/updatepdf/:id').put(verifyJWT, upload.single("Pdf"), updatepdfdetails)

export default router;
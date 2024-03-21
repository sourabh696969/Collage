import { Router } from "express";
import {uploaddepartment, getalldepartment, deletedepartment, getSingledepartment, updatedepartmentdetails,} from "../controllers/department_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploaddepartment").post(verifyJWT, upload.fields([
    {
        name: "Image",
        maxCount: 1
    }
]), uploaddepartment)
router.route('/getdepartment').get(getalldepartment)
router.route('/getsingledepartment/:id').get(getSingledepartment)
router.route('/deletedepartment/:id').delete(verifyJWT, deletedepartment)
router.route('/updatedepartment/:id').put(verifyJWT, upload.single("Image"), updatedepartmentdetails)

export default router;
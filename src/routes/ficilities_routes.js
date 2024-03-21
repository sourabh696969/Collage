import { Router } from "express";
import {uploadficilities, getallficilities, deleteficilities, getSingleficilities, updateficilitiesdetails, } from "../controllers/ficilities_controllers.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
const router = Router()

router.route("/uploadficilities").post(verifyJWT, upload.fields([
    {
        name: "Image",
        maxCount: 1
    }
]), uploadficilities)
router.route('/getficilities').get(getallficilities)
router.route('/getsingleficilities/:id').get(getSingleficilities)
router.route('/deleteficilities/:id').delete(verifyJWT, deleteficilities)
router.route('/updateficilities/:id').put(verifyJWT, upload.single("Image"), updateficilitiesdetails)

export default router;
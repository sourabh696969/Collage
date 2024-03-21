import { Router } from "express";
import { uploadBlog ,getallblogs,getSingleBlogs,deleteBlogs,updateBlogById} from "../controllers/blog_controller.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";
import { upload } from "../middlewares/multer_middleware.js";
const router = Router()

router.route("/uploadblog").post(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    }
]), uploadBlog)
router.route('/getallblogs').get(getallblogs)
router.route('/getSingleBlogs/:id').get(getSingleBlogs)
router.route('/deleteBlogs/:id').delete(verifyJWT,deleteBlogs)
router.route("/updatelogs/:id").put(verifyJWT,upload.single("thumbnail"), updateBlogById)

export default router;
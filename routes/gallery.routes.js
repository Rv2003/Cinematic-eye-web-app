import { Router } from "express";
import { upload } from "../middleware/upload.middleware.js";
import authorize, { isAdmin } from "../middleware/auth.middleware.js"; // use your own names
import { getPhotos, uploadPhotos, updatePhoto, deletePhoto } from "../controller/gallery.controller.js";

const router = Router();

router.get("/", getPhotos);                                                    // public
router.post("/",authorize,isAdmin, upload.array("images", 20), uploadPhotos);
router.patch("/:id",authorize,isAdmin, updatePhoto);
router.delete("/:id",authorize,isAdmin, deletePhoto);

export default router;
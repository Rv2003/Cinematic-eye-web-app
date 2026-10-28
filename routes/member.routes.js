import { Router } from "express";
import authorize, { isAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  addMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../controller/member.controller.js";

const router = Router();

router.get("/", getMembers);
router.post("/", authorize, isAdmin, upload.single("photo"), addMember);
router.patch("/:id", authorize, isAdmin, upload.single("photo"), updateMember);
router.delete("/:id", authorize, isAdmin, deleteMember);

export default router;
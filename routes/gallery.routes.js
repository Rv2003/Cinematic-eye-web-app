
import { Router } from "express";
import { getFacebookGallery } from "../controller/gallery.controller.js";

const galleryRouter = Router();

galleryRouter.get("/", getFacebookGallery);

export default galleryRouter;

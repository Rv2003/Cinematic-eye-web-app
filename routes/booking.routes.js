import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createBooking } from "../controller/package.controller.js";
import { getBooking } from "../controller/package.controller.js";
const bookingRouter=Router();


bookingRouter.post('/',authorize,createBooking)
bookingRouter.get('/records',authorize,getBooking)

export default bookingRouter;
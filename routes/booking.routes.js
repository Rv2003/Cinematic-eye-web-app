import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createBooking, deletePackage, patchStatus } from "../controller/package.controller.js";
import { getBooking } from "../controller/package.controller.js";
import {getAll}from "../controller/package.controller.js"
const bookingRouter=Router();


bookingRouter.post('/',authorize,createBooking)
bookingRouter.get('/records',authorize,getBooking)
bookingRouter.get('/all',authorize,getAll)
bookingRouter.patch('/:id/status',authorize,patchStatus)
bookingRouter.delete('/:id/delete',authorize,deletePackage)
export default bookingRouter;
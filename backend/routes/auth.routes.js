import { Router } from "express";
import {signup,signin,signout,refresh,googlesignup} from "../controller/auth.controller.js";


const authRouter = Router();
authRouter.post("/sign-up",signup);
authRouter.post("/sign-in", signin);
authRouter.post("/sign-out",signout);
authRouter.post("/refresh",refresh)
authRouter.post("/google-signup",googlesignup)
export default authRouter

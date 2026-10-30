import { Router } from "express";
import  {getUser} from "../controller/user.controller.js";
import  {getUsers} from "../controller/user.controller.js";
import authorize from "../middleware/auth.middleware.js";
const userRouter=Router();

userRouter.get('/',getUsers)
userRouter.get('/:id',authorize,getUser)


userRouter.delete('/:id',(req,res)=>res.send({messagge:"delete all the users"}))

export default userRouter;
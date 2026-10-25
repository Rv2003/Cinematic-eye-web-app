import express from 'express'
import { PORT } from './config/env.js'
import userRouter from './routes/user.routes.js'
import bookingRouter from './routes/booking.routes.js'
import authRouter from './routes/auth.routes.js'
import connectToDatabase from './database/mongodb.js'
import cookieParser from 'cookie-parser'
import errorMiddleware from './middleware/error.middleware.js'
import otpRoutes from '../backend/routes/otp.routes.js'
import galleryRoutes from "./routes/gallery.routes.js";
import cors from "cors";



const app = express()
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
  credentials: true
}));
app.options("*", cors());
app.use(express.json()) //handle api calls 
app.use(express.urlencoded({ extended: false })) //handle form data
app.use(cookieParser())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/booking', bookingRouter)
app.use("/api/v1/otp", otpRoutes);
app.use(errorMiddleware)
app.use("/api/v1/gallery", galleryRoutes);
app.get('/', (req, res) => {

})

app.listen(PORT,async () => {
    await connectToDatabase()
})



export default app;
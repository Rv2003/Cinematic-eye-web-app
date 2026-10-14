import express from 'express'
import { PORT } from './config/env.js'
import userRouter from './routes/user.routes.js'
import bookingRouter from './routes/booking.routes.js'
import authRouter from './routes/auth.routes.js'
import connectToDatabase from './database/mongodb.js'
import cookieParser from 'cookie-parser'
import errorMiddleware from './middleware/error.middleware.js'
import otpRoutes from '../backend/routes/otp.routes.js'
import cors from "cors";



const app = express()
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

app.get('/', (req, res) => {
    res.send('pakaya')
})

app.listen(PORT,async () => {
    console.log('pakaay');
    await connectToDatabase()
})



export default app;
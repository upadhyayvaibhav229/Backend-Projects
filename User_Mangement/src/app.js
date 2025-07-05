import express, { json } from "express";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))

app.use(cookieParser());
app.use(json())


import userRouter from './routes/user.routes.js'
app.use('/api/users', userRouter)
export { app }
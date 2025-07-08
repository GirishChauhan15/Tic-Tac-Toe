import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {rateLimit} from 'express-rate-limit'

const app = new express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    methods : ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:true
}))
app.use(cookieParser())

const limiter = rateLimit({
    windowMs : 1 * 60 * 1000,
    limit: 50,
    legacyHeaders: false,
    standardHeaders: 'draft-8',
    handler : (req,res) => {
        res.status(429).json({message : "Too many requests, please try again later.", success : false})
    }
})

app.use(limiter)

import gameRouter from './routes/game.router.js'

app.use('/api/v1/game', gameRouter)

export default app
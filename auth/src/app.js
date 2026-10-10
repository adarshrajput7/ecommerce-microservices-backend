import express from 'express'
import cookieParser from 'cookie-parser'
import routes from './routes/auth.routes.js'
import cors from 'cors'

const app = express()



app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, // Important for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json({
        message:'Auth Service is running.'
    })
})


app.use('/api/auth',routes)





export default app
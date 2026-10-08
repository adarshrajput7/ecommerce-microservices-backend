import express from 'express'
import cookieParser from 'cookie-parser'
import orderRoutes from './routes/order.routes.js'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, // Important for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))


app.get('/', (req, res) => {
    res.status(200).json({
        message:'Order Service is running.'
    })
})

app.use('/api/order',orderRoutes)





export default app
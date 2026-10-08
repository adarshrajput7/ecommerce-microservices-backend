import express from 'express'
import cookieParser from 'cookie-parser';
import productRoutes from './routes/product.routes.js'
import cors from 'cors'

const app = express();
app.use(express.json())
app.use(cookieParser())

app.use(cors());

// app.use(cors({
//     origin: 'http://localhost:5173', 
//     credentials: true, // Important for cookies
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }))

app.get('/', (req, res) => {
    res.status(200).json({
        message:'Product Service is running.'
    })
})

app.use('/api/product',productRoutes)


export default app
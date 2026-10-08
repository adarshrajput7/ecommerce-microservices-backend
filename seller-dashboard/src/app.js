import express from 'express'
import cookieParser from 'cookie-parser'
import sellerRouter from './routes/seller.routes.js'



const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json({
        message:'Seller Dashboard Service is running.'
    })
})

app.use('/api/seller/dashboard', sellerRouter)

export default app
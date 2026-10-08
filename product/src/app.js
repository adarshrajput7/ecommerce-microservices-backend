// import express from 'express'
// import cookieParser from 'cookie-parser';
// import productRoutes from './routes/product.routes.js'
// import cors from 'cors'

// const app = express();
// app.use(express.json())
// app.use(cookieParser())

// app.use(cors());

// // app.use(cors({
// //     origin: 'http://localhost:5173',
// //     credentials: true, // Important for cookies
// //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
// //     allowedHeaders: ['Content-Type', 'Authorization']
// // }))

// app.get('/', (req, res) => {
//     res.status(200).json({
//         message:'Product Service is running.'
//     })
// })

// app.use('/api/product',productRoutes)


// export default app

import express from 'express'
import cookieParser from 'cookie-parser'
import productRoutes from './routes/product.routes.js'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cookieParser())

// Direct origin allow with credentials support
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Product Service is running.'
  })
})

// Dono paths support karo: Chahe gateway rewrite kare ya na kare, crash nahi hoga
app.use('/api/product', productRoutes)
app.use('/product', productRoutes)

// Error Handler: Taaki koi error aaye toh Express hang na ho, clean JSON throw kare
app.use((err, req, res, next) => {
  console.error("Product Service Error:", err.message);
  res.status(500).json({ error: err.message });
})

export default app
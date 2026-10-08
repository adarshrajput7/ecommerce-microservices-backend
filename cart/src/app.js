// import express from 'express'
// import cookieParser from 'cookie-parser'
// import routes from './routes/cart.route.js'
// import cors from 'cors'


// const app = express()

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
//         message:'Cart Service is running.'
//     })
// })

// app.use('/api/cart',routes)




// export default app



import express from 'express'
import cookieParser from 'cookie-parser'
import routes from './routes/cart.route.js'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cookieParser())

// Fix: origin ko true rakho taaki Vercel aur Localhost dono dynamic match hon aur credentials allow rahein
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Cart Service is running.'
    })
})

app.use('/api/cart', routes)

export default app
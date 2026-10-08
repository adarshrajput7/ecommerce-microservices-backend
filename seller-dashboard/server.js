import dotenv from 'dotenv'
import app from './src/app.js'
import connectDB from './src/db/db.js'
import {listener} from './src/broker/listener.js'
import broker from './src/broker/broker.js'




dotenv.config()

const PORT =3007

connectDB()

broker.connect().then(() => {
    listener()
})

app.listen(PORT, () => {
    console.log("Seller-dash server running on ",PORT);
    
})
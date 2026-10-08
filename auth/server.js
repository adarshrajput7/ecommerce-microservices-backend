import app from "./src/app.js";
import dotenv from 'dotenv'
import connectDB from "./src/db/db.js";
import {connect}  from './src/broker/broker.js'

dotenv.config()


const PORT = 3000;


connectDB()
connect()
app.listen(PORT, () => {
    console.log(`Auth Server is running on `,PORT);
})
import app from "./src/app.js";
import dotenv from 'dotenv'
import connectDB from "./src/db/db.js";
import broker from "./src/broker/broker.js";

dotenv.config()

const PORT = 3004



connectDB()
broker.connect()
app.listen(PORT, () => {
    console.log("Payment service is running on ", PORT)
})
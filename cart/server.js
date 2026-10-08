import app from "./src/app.js";
import dotenv from 'dotenv'
import connectDB from "./src/db/db.js";


dotenv.config()
const PORT = 3002


connectDB()
app.listen(PORT, () => {
    console.log("Cart Server is running on ",PORT);
})
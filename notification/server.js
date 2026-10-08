import dotenv from 'dotenv'
import app from './src/app.js';

dotenv.config()

const PORT = 3006


app.listen(PORT, () => {
    console.log('Notification server started on ',PORT);
});

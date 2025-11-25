import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api_routes.js';
import authRoutes from './routes/auth_routes.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT ||5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes)
app.use('/api/board', apiRoutes);

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})
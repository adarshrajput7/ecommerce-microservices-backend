import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Microservices ke routers direct import karo
import authRoutes from '../auth/src/routes/auth.routes.js';
import productRoutes from '../product/src/routes/product.routes.js';
import cartRoutes from '../cart/src/routes/cart.route.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

// Dynamic CORS for frontend
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Root health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API Gateway Live' });
});

// Direct Route Mounts (Zero Proxy Overhead)
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/cart', cartRoutes);

// Global Error Handler (Taaki koi route crash ho toh request latke nahi)
app.use((err, req, res, next) => {
  console.error("Gateway Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running directly on port ${PORT}`);
});
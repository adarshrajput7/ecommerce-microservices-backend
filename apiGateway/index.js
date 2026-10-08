import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecommerce-user-client.vercel.app'
  ],
  credentials: true
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is live' });
});

// 1. AUTH SERVICE (Port 3000)
// Handles: /me, /login, /register, /logout, /auth/*, /api/auth/*
app.use(
  ['/me', '/login', '/register', '/logout', '/auth', '/api/auth'],
  createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: (path) => {
      if (path.startsWith('/api/auth')) return path;
      if (path.startsWith('/auth')) return path.replace('/auth', '/api/auth');
      return `/api/auth${path}`; // /me -> /api/auth/me, /login -> /api/auth/login
    }
  })
);

// 2. PRODUCT SERVICE (Port 3001)
// Handles: /product, /products, /api/product, /api/products (with trailing slashes and queries)
app.use(
  ['/product', '/products', '/api/product', '/api/products'],
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: (path) => {
      // Replaces /product or /products (with or without trailing slash) to /api/product
      return path.replace(/^\/(product|products)\/?/, '/api/product');
    }
  })
);

// 3. CART SERVICE (Port 3002)
// Handles: /cart, /api/cart
app.use(
  ['/cart', '/api/cart'],
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: (path) => {
      return path.replace(/^\/cart\/?/, '/api/cart');
    }
  })
);

// 4. ORDER SERVICE (Port 3003)
app.use(
  ['/order', '/api/order'],
  createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: (path) => {
      return path.replace(/^\/order\/?/, '/api/order');
    }
  })
);

// 5. PAYMENT SERVICE (Port 3004)
app.use(
  ['/payments', '/api/payments'],
  createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: (path) => {
      return path.replace(/^\/payments\/?/, '/api/payments');
    }
  })
);

// 6. SELLER DASHBOARD (Port 3007)
app.use(
  ['/seller/dashboard', '/api/seller/dashboard'],
  createProxyMiddleware({
    target: 'http://localhost:3007',
    changeOrigin: true
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
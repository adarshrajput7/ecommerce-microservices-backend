import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecommerce-user-client.vercel.app'
  ],
  credentials: true
}));

const routes = [
  // Auth Service (Port 3000)
  {
    path: ['/me', '/auth', '/api/auth'],
    target: 'http://localhost:3000',
    pathRewrite: (path) => path.startsWith('/api/auth') ? path : `/api/auth${path}`
  },

  // Product Service (Port 3001) - Handles /product, /products, /api/product
  {
    path: ['/product', '/products', '/api/product', '/api/products'],
    target: 'http://localhost:3001',
    pathRewrite: (path) => path.replace(/^\/(product|products)/, '/api/product')
  },

  // Cart Service (Port 3002)
  {
    path: ['/cart', '/api/cart'],
    target: 'http://localhost:3002',
    pathRewrite: (path) => path.startsWith('/api/cart') ? path : `/api/cart${path}`
  },

  // Order Service (Port 3003)
  {
    path: ['/order', '/api/order'],
    target: 'http://localhost:3003',
    pathRewrite: (path) => path.startsWith('/api/order') ? path : `/api/order${path}`
  },

  // Payments Service (Port 3004)
  {
    path: ['/payments', '/api/payments'],
    target: 'http://localhost:3004',
    pathRewrite: (path) => path.startsWith('/api/payments') ? path : `/api/payments${path}`
  },

  // Seller Dashboard (Port 3007)
  {
    path: ['/seller/dashboard', '/api/seller/dashboard'],
    target: 'http://localhost:3007'
  }
];

routes.forEach(route => {
  app.use(route.path, createProxyMiddleware({
    target: route.target,
    changeOrigin: true,
    pathRewrite: route.pathRewrite || undefined
  }));
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});
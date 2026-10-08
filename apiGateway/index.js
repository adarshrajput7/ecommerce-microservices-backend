
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://ecommerce-user-client.vercel.app' // <-- ye add karo
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const routes = [
  // Auth Service (handles /me and /api/auth)
  { path: '/me', target: 'http://localhost:3000', rewrite: () => '/api/auth/me' },
  { path: '/api/auth', target: 'http://localhost:3000' },
  { path: '/auth', target: 'http://localhost:3000', rewrite: (path) => path.replace('/auth', '/api/auth') },

  // Product Service (handles /product and /api/product)
  { path: '/api/product', target: 'http://localhost:3001' },
  { path: '/product', target: 'http://localhost:3001', rewrite: (path) => path.replace('/product', '/api/product') },

  // Cart Service (handles /cart and /api/cart)
  { path: '/api/cart', target: 'http://localhost:3002' },
  { path: '/cart', target: 'http://localhost:3002', rewrite: (path) => path.replace('/cart', '/api/cart') },

  // Order Service
  { path: '/api/order', target: 'http://localhost:3003' },
  { path: '/order', target: 'http://localhost:3003', rewrite: (path) => path.replace('/order', '/api/order') },

  // Payments Service
  { path: '/api/payments', target: 'http://localhost:3004' },
  { path: '/payments', target: 'http://localhost:3004', rewrite: (path) => path.replace('/payments', '/api/payments') },

  // Seller Dashboard
  { path: '/api/seller/dashboard', target: 'http://localhost:3007' }
];

routes.forEach((route) => {
  app.use(
    route.path,
    createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      pathRewrite: route.rewrite ? route.rewrite : undefined,
    })
  );
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});
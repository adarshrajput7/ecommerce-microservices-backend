
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
  { path: '/api/auth', target: 'http://localhost:3000' },
  { path: '/api/product', target: 'http://localhost:3001' },
  { path: '/api/cart', target: 'http://localhost:3002' },
  { path: '/api/order', target: 'http://localhost:3003' },
  { path: '/api/payments', target: 'http://localhost:3004' },
  { path: '/api/seller/dashboard', target: 'http://localhost:3007' }
];

routes.forEach(({ path, target }) => {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (reqPath) => `${path}${reqPath}`
  }));
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});
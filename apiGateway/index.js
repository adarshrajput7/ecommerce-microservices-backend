import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Browser CORS & Preflight handler
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Direct Proxy Helper (No Path Rewriting - Exact Forwarding)
const createServiceProxy = (port) => createProxyMiddleware({
  target: `http://127.0.0.1:${port}`,
  changeOrigin: true,
  xfwd: true,
  onProxyRes: (proxyRes, req) => {
    const origin = req.headers.origin;
    if (origin) {
      delete proxyRes.headers['access-control-allow-origin'];
      delete proxyRes.headers['access-control-allow-credentials'];
      proxyRes.headers['access-control-allow-origin'] = origin;
      proxyRes.headers['access-control-allow-credentials'] = 'true';
    }
  },
  onError: (err, req, res) => {
    console.error(`Proxy Error on port ${port}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Service Unavailable', details: err.message });
    }
  }
});

// 3. Exact Path Mounting
// Auth Service (Port 3000)
app.use(['/api/auth', '/me', '/login', '/register', '/logout'], createServiceProxy(3000));

// Product Service (Port 3001) - Direct forward /api/product
app.use(['/api/product', '/product'], createServiceProxy(3001));

// Cart Service (Port 3002)
app.use(['/api/cart', '/cart'], createServiceProxy(3002));

// Order Service (Port 3003)
app.use(['/api/order', '/order'], createServiceProxy(3003));

// Payment Service (Port 3004)
app.use(['/api/payments', '/payments'], createServiceProxy(3004));

// Seller Dashboard (Port 3007)
app.use(['/api/seller/dashboard', '/seller/dashboard'], createServiceProxy(3007));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'API Gateway Live' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway running on port ${PORT}`);
});
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  'https://ecommerce-user-client.vercel.app',
  'http://localhost:5173'
];

// 1. Gateway Level Clean CORS Handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Proxy Helper: Overrides whatever microservices return for CORS
const proxyService = (target, defaultPrefix) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: (path) => {
    if (path.startsWith('/api/')) return path;
    return `${defaultPrefix}${path.startsWith('/') ? path : '/' + path}`;
  },
  onProxyRes: (proxyRes, req) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      proxyRes.headers['access-control-allow-origin'] = origin;
      proxyRes.headers['access-control-allow-credentials'] = 'true';
    }
  }
});

// 3. Mount All Services
app.use(['/me', '/login', '/register', '/logout', '/auth', '/api/auth'], createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: (path) => {
    if (path.startsWith('/api/auth')) return path;
    if (path.startsWith('/auth')) return path.replace('/auth', '/api/auth');
    return `/api/auth${path.startsWith('/') ? path : '/' + path}`;
  },
  onProxyRes: (proxyRes, req) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      proxyRes.headers['access-control-allow-origin'] = origin;
      proxyRes.headers['access-control-allow-credentials'] = 'true';
    }
  }
}));

app.use(['/product', '/products', '/api/product', '/api/products'], proxyService('http://localhost:3001', '/api/product'));
app.use(['/cart', '/api/cart'], proxyService('http://localhost:3002', '/api/cart'));
app.use(['/order', '/api/order'], proxyService('http://localhost:3003', '/api/order'));
app.use(['/payments', '/api/payments'], proxyService('http://localhost:3004', '/api/payments'));
app.use(['/seller/dashboard', '/api/seller/dashboard'], createProxyMiddleware({ target: 'http://localhost:3007', changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
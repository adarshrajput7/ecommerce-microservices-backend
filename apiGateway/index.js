import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  'https://ecommerce-user-client.vercel.app',
  'http://localhost:5173'
];

// 1. Gateway CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.options('*', cors());

// Helper function jo backend microservices ke galat CORS header ko override karega
const overrideCors = (proxyRes, req) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    proxyRes.headers['access-control-allow-origin'] = origin;
    proxyRes.headers['access-control-allow-credentials'] = 'true';
  }
};

const createServiceProxy = (target, defaultPrefix) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => {
      if (path.startsWith('/api/')) return path;
      return `${defaultPrefix}${path.startsWith('/') ? path : '/' + path}`;
    },
    onProxyRes: overrideCors
  });
};

// 1. Auth Service (Port 3000)
app.use(
  ['/me', '/login', '/register', '/logout', '/auth', '/api/auth'],
  createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: (path) => {
      if (path.startsWith('/api/auth')) return path;
      if (path.startsWith('/auth')) return path.replace('/auth', '/api/auth');
      return `/api/auth${path.startsWith('/') ? path : '/' + path}`;
    },
    onProxyRes: overrideCors
  })
);

// 2. Product Service (Port 3001)
app.use(
  ['/product', '/products', '/api/product', '/api/products'],
  createServiceProxy('http://localhost:3001', '/api/product')
);

// 3. Cart Service (Port 3002)
app.use(
  ['/cart', '/api/cart'],
  createServiceProxy('http://localhost:3002', '/api/cart')
);

// 4. Order Service (Port 3003)
app.use(
  ['/order', '/api/order'],
  createServiceProxy('http://localhost:3003', '/api/order')
);

// 5. Payment Service (Port 3004)
app.use(
  ['/payments', '/api/payments'],
  createServiceProxy('http://localhost:3004', '/api/payments')
);

// 6. Seller Dashboard (Port 3007)
app.use(
  ['/seller/dashboard', '/api/seller/dashboard'],
  createProxyMiddleware({
    target: 'http://localhost:3007',
    changeOrigin: true,
    onProxyRes: overrideCors
  })
);

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
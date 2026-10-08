import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://ecommerce-user-client.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

const url = (name, fallback) => {
  const v = process.env[name];
  if (!v && isProd) console.error(`MISSING ENV: ${name}`);
  return (v || fallback).replace(/\/$/, '');
};

const routes = [
  {
    path: ['/me', '/auth', '/api/auth'],
    target: url('AUTH_URL', 'http://localhost:3000'),
    pathRewrite: (p) => p.startsWith('/api/auth') ? p : `/api/auth${p}`
  },
  {
    path: ['/product', '/products', '/api/product', '/api/products'],
    target: url('PRODUCT_URL', 'http://localhost:3001'),
    pathRewrite: (p) => p.replace(/^\/(product|products)/, '/api/product')
  },
  {
    path: ['/cart', '/api/cart'],
    target: url('CART_URL', 'http://localhost:3002'),
    pathRewrite: (p) => p.startsWith('/api/cart') ? p : `/api/cart${p}`
  },
  {
    path: ['/order', '/api/order'],
    target: url('ORDER_URL', 'http://localhost:3003'),
    pathRewrite: (p) => p.startsWith('/api/order') ? p : `/api/order${p}`
  },
  {
    path: ['/payments', '/api/payments'],
    target: url('PAYMENT_URL', 'http://localhost:3004'),
    pathRewrite: (p) => p.startsWith('/api/payments') ? p : `/api/payments${p}`
  },
  {
    path: ['/seller/dashboard', '/api/seller/dashboard'],
    target: url('SELLER_URL', 'http://localhost:3007')
  }
];

routes.forEach((route) => {
  app.use(createProxyMiddleware({
    pathFilter: route.path,
    target: route.target,
    changeOrigin: true,
    pathRewrite: route.pathRewrite,
    proxyTimeout: 60000,
    timeout: 60000,
    on: {
      proxyRes: (proxyRes) => {
        Object.keys(proxyRes.headers).forEach((h) => {
          if (h.toLowerCase().startsWith('access-control-')) {
            delete proxyRes.headers[h];
          }
        });
      },
      error: (err, req, res) => {
        console.error('Proxy error:', req.originalUrl, '->', route.target, err.message);
        if (!res.headersSent) res.status(502).json({ message: 'Service unavailable' });
      }
    }
  }));
});

app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
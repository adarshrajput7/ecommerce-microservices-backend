import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

// 1. DYNAMIC CORS: Kisi bhi incoming origin ko allow karega with full credentials
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

  // Preflight OPTIONS ko gateway level par hi 200 return karo
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Proxy Helper
const proxyService = (target, defaultPrefix) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: (path) => {
    if (path.startsWith('/api/')) return path;
    return `${defaultPrefix}${path.startsWith('/') ? path : '/' + path}`;
  },
  onProxyRes: (proxyRes, req) => {
    const origin = req.headers.origin;
    if (origin) {
      proxyRes.headers['access-control-allow-origin'] = origin;
      proxyRes.headers['access-control-allow-credentials'] = 'true';
    }
  }
});

// 3. Mount Routes
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
    if (origin) {
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
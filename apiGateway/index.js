import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

// 1. CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecommerce-user-client.vercel.app'
  ],
  credentials: true
}));

// 2. Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is live' });
});

// 3. Service Routing Rules
const services = [
  // Auth Service (Port 3000) -> Handles /me, /auth, /api/auth
  {
    prefix: ['/me', '/auth', '/api/auth'],
    target: 'http://localhost:3000',
    pathRewrite: (path) => {
      if (path.startsWith('/me')) return `/api/auth${path}`;
      if (path.startsWith('/auth')) return `/api${path}`;
      return path;
    }
  },

  // Product Service (Port 3001) -> Handles /product, /products, /api/product
  {
    prefix: ['/product', '/products', '/api/product', '/api/products'],
    target: 'http://localhost:3001',
    pathRewrite: (path) => {
      // Normalizes /product/?limit=12 or /product/ to /api/product?limit=12
      const cleaned = path.replace(/^\/(product|products)\/?/, '/api/product/');
      return cleaned.startsWith('/api/product') ? cleaned : `/api${path}`;
    }
  },

  // Cart Service (Port 3002) -> Handles /cart, /api/cart
  {
    prefix: ['/cart', '/api/cart'],
    target: 'http://localhost:3002',
    pathRewrite: (path) => {
      const cleaned = path.replace(/^\/cart\/?/, '/api/cart/');
      return cleaned.startsWith('/api/cart') ? cleaned : `/api${path}`;
    }
  },

  // Order Service (Port 3003) -> Handles /order, /api/order
  {
    prefix: ['/order', '/api/order'],
    target: 'http://localhost:3003',
    pathRewrite: (path) => {
      const cleaned = path.replace(/^\/order\/?/, '/api/order/');
      return cleaned.startsWith('/api/order') ? cleaned : `/api${path}`;
    }
  },

  // Payment Service (Port 3004) -> Handles /payments, /api/payments
  {
    prefix: ['/payments', '/api/payments'],
    target: 'http://localhost:3004',
    pathRewrite: (path) => {
      const cleaned = path.replace(/^\/payments\/?/, '/api/payments/');
      return cleaned.startsWith('/api/payments') ? cleaned : `/api${path}`;
    }
  },

  // Seller Dashboard Service (Port 3007)
  {
    prefix: ['/seller/dashboard', '/api/seller/dashboard'],
    target: 'http://localhost:3007',
    pathRewrite: (path) => {
      if (!path.startsWith('/api')) return `/api${path}`;
      return path;
    }
  }
];

// 4. Attach Proxies
services.forEach(({ prefix, target, pathRewrite }) => {
  app.use(
    prefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite,
      logLevel: 'debug'
    })
  );
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
// import express from 'express';
// import cors from 'cors';
// import { createProxyMiddleware } from 'http-proxy-middleware';

// const app = express();

// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'https://ecommerce-user-client.vercel.app'
//   ],
//   credentials: true
// }));

// const routes = [
//   // Auth Service (Port 3000)
//   {
//     path: ['/me', '/auth', '/api/auth'],
//     target: 'http://localhost:3000',
//     pathRewrite: (path) => path.startsWith('/api/auth') ? path : `/api/auth${path}`
//   },

//   // Product Service (Port 3001) - Handles /product, /products, /api/product
//   {
//     path: ['/product', '/products', '/api/product', '/api/products'],
//     target: 'http://localhost:3001',
//     pathRewrite: (path) => path.replace(/^\/(product|products)/, '/api/product')
//   },

//   // Cart Service (Port 3002)
//   {
//     path: ['/cart', '/api/cart'],
//     target: 'http://localhost:3002',
//     pathRewrite: (path) => path.startsWith('/api/cart') ? path : `/api/cart${path}`
//   },

//   // Order Service (Port 3003)
//   {
//     path: ['/order', '/api/order'],
//     target: 'http://localhost:3003',
//     pathRewrite: (path) => path.startsWith('/api/order') ? path : `/api/order${path}`
//   },

//   // Payments Service (Port 3004)
//   {
//     path: ['/payments', '/api/payments'],
//     target: 'http://localhost:3004',
//     pathRewrite: (path) => path.startsWith('/api/payments') ? path : `/api/payments${path}`
//   },

//   // Seller Dashboard (Port 3007)
//   {
//     path: ['/seller/dashboard', '/api/seller/dashboard'],
//     target: 'http://localhost:3007'
//   }
// ];

// routes.forEach(route => {
//   app.use(route.path, createProxyMiddleware({
//     target: route.target,
//     changeOrigin: true,
//     pathRewrite: route.pathRewrite || undefined
//   }));
// });

// app.get('/health', (req, res) => {
//   res.status(200).send('OK');
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Gateway running on http://localhost:${PORT}`);
// });

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecommerce-user-client.vercel.app'   // exact frontend URL, bina trailing slash ke
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const routes = [
  {
    path: ['/me', '/auth', '/api/auth'],
    target: process.env.AUTH_URL || 'http://localhost:3000',
    pathRewrite: (path) => path.startsWith('/api/auth') ? path : `/api/auth${path}`
  },
  {
    path: ['/product', '/products', '/api/product', '/api/products'],
    target: process.env.PRODUCT_URL || 'http://localhost:3001',
    pathRewrite: (path) => path.replace(/^\/(product|products)/, '/api/product')
  },
  {
    path: ['/cart', '/api/cart'],
    target: process.env.CART_URL || 'http://localhost:3002',
    pathRewrite: (path) => path.startsWith('/api/cart') ? path : `/api/cart${path}`
  },
  {
    path: ['/order', '/api/order'],
    target: process.env.ORDER_URL || 'http://localhost:3003',
    pathRewrite: (path) => path.startsWith('/api/order') ? path : `/api/order${path}`
  },
  {
    path: ['/payments', '/api/payments'],
    target: process.env.PAYMENT_URL || 'http://localhost:3004',
    pathRewrite: (path) => path.startsWith('/api/payments') ? path : `/api/payments${path}`
  },
  {
    path: ['/seller/dashboard', '/api/seller/dashboard'],
    target: process.env.SELLER_URL || 'http://localhost:3007'
  }
];

routes.forEach(route => {
  app.use(createProxyMiddleware({
    pathFilter: route.path,
    target: route.target,
    changeOrigin: true,
    pathRewrite: route.pathRewrite,
    on: {
      error: (err, req, res) => {
        console.error('Proxy error:', req.originalUrl, err.message);
        res.status(502).json({ message: 'Service unavailable' });
      }
    }
  }));
});

app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
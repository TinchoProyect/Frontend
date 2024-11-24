import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Proxy target configuration
const PROXY_TARGET = 'http://1.tcp.sa.ngrok.io:20186';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    proxy: {
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: false,
        ws: false, // Disable WebSocket as it's not needed
        xfwd: true,
        proxyTimeout: 30000,
        timeout: 30000,
        headers: {
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=30',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Remove problematic headers
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            
            console.info('Outgoing request:', {
              method: req.method,
              url: req.url,
              headers: proxyReq.getHeaders()
            });
          });

          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.info('Incoming response:', {
              status: proxyRes.statusCode,
              url: req.url,
              headers: proxyRes.headers
            });
          });

          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', {
              error: err.message,
              code: err.code,
              url: req.url
            });

            // Send a more detailed error response
            const errorResponse = {
              error: 'Proxy Error',
              message: err.message,
              code: err.code,
              url: req.url
            };

            if (!res.headersSent) {
              res.writeHead(502, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
            }

            res.end(JSON.stringify(errorResponse));
          });
        },
        rewrite: (path) => {
          // Simplified path rewriting
          const pathMap = {
            '/api/health': '/Consulta',
            '/api/Consulta': '/Consulta',
            '/api/movimientos': '/movimientos',
            '/api/saldos': '/SaldosIniciales'
          };

          // Find matching path or remove /api prefix
          const newPath = pathMap[path] || path.replace(/^\/api/, '');
          
          console.info('Path rewrite:', { from: path, to: newPath });
          return newPath;
        }
      }
    }
  },
  preview: {
    port: 3002,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
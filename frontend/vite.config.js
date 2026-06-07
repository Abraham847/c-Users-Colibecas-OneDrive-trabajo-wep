import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@services': path.resolve(__dirname, './src/services'),
            '@store': path.resolve(__dirname, './src/store'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@types': path.resolve(__dirname, './src/types'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': { target: 'http://localhost:5000', changeOrigin: true },
            '/ws': { target: 'ws://localhost:5000', ws: true },
            '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
            '/site': { target: 'http://localhost:5000', changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: { manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'] } },
        },
    },
});

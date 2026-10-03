import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [tailwindcss()], build: { rollupOptions: { output: { manualChunks: { charts: ['recharts'], react: ['react', 'react-dom', 'react-router-dom'] } } } } });

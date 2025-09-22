import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import json from '@rollup/plugin-json'; // ← أضفناها هنا

export default defineConfig({
  plugins: [react(), json()], // ← أضفنا البلجن هنا
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // The same bundle works at a domain root or a Pages project path.
  server: { host: '0.0.0.0', port: 5173, allowedHosts: ['.e2b.app'] },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: ['.e2b.app'] },
});

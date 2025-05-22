import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load env vars based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    base: env.VITE_ASSETS || '/',
    define: {
      __BASE_PATH__: JSON.stringify(env.VITE_ASSETS || '/'),
    },
    server: {
      host: '0.0.0.0',
    }
  };
});

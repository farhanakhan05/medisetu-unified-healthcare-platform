import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // 1. Import the Tailwind plugin

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Ensure this exactly matches your GitHub repository name
      base: '/medisetu-unified-healthcare-platform/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(), // 2. Add Tailwind to the plugins array
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});



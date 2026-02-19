// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://elmagow.github.io',
  base: '/sitemariage/',
  output: 'static',
  vite: {
    // @ts-ignore -- Vite version skew between @tailwindcss/vite and Astro's embedded Vite
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
  ],
});

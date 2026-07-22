import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    // Honor an externally assigned port (e.g. preview harnesses) when present.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
})

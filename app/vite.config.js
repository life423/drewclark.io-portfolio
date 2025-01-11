import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // Option A: If index.html is directly in app/:
    root: './src',
    build: {
        outDir: 'dist', // compiled output goes here
    },
})

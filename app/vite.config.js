import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    root: './src', // if your index.html is in src/
    build: {
        outDir: '../dist', // puts the final build in app/dist
    },
    plugins: [react()],
})

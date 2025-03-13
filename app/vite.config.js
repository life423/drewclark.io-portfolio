import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables based on mode
export default defineConfig(({ command, mode }) => {
    // Load env file based on `mode` in the current directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '')
    
    // Load from dotenv as well (belt and suspenders approach)
    dotenv.config({
        path: path.resolve(process.cwd(), `.env.${mode}`)
    })
    
    console.log(`Building for mode: ${mode}`)
    console.log(`VITE_API_URL: ${env.VITE_API_URL}`)
    
    return {
        root: './src', // if your index.html is in src/
        build: {
            outDir: '../dist', // puts the final build in app/dist
        },
        plugins: [react()],
        // Make all env variables available in Vite under import.meta.env
        define: {
            'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
            'process.env.VITE_NODE_ENV': JSON.stringify(env.VITE_NODE_ENV),
        }
    }
})

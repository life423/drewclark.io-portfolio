import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'
import { resolve } from 'path'

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
        publicDir: '../public', // Specify the public directory at project root
        base: '/', // Use absolute paths
        server: {
            port: 5173, // Explicit Vite port to avoid conflicts
            host: '0.0.0.0', // Bind to all interfaces instead of just localhost
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true
                }
            }
        },
        build: {
            outDir: '../dist', // puts the final build in app/dist
            emptyOutDir: true, // Clean the output directory before build
            assetsInlineLimit: 0, // Don't inline any assets
        },
        plugins: [
            react(),
            {
                name: 'html-transform',
                transformIndexHtml(html) {
                    // Ensure the title is preserved
                    if (html.indexOf('<title>My App</title>') !== -1) {
                        html = html.replace('<title>My App</title>', '<title>drewclark.io</title>');
                    }
                    
                    return html;
                }
            }
        ],
        resolve: {
            alias: {
                '@react-three/fiber': path.resolve(__dirname, 'node_modules/@react-three/fiber/dist/index.js'),
                'three': path.resolve(__dirname, 'node_modules/three/build/three.module.js')
            }
        },
    // Make all env variables available in Vite under import.meta.env
    define: {
        // Properly define for import.meta.env access
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/api/askGPT'),
        'import.meta.env.MODE': JSON.stringify(mode),
        // Keep backward compatibility with process.env if needed
        'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/api/askGPT'),
        'process.env.VITE_NODE_ENV': JSON.stringify(env.VITE_NODE_ENV)
    }
    }
})

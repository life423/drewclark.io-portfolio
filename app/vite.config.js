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
        base: './', // Use relative paths
        server: {
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
                    
                    // Add favicon links if they're missing
                    if (html.indexOf('<link rel="icon"') === -1) {
                        const headEnd = html.indexOf('</head>');
                        if (headEnd !== -1) {
                            const faviconLinks = `
    <!-- Favicon Implementation -->
    <link rel="icon" href="favicon/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">
    <link rel="apple-touch-icon" href="favicon/apple-touch-icon.png">`;
                            
                            html = html.slice(0, headEnd) + faviconLinks + html.slice(headEnd);
                        }
                    }
                    
                    return html;
                }
            }
        ],
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

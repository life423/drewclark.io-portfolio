#!/usr/bin/env node
/**
 * Lean Development Startup Script for Drew Clark Portfolio
 */

const { spawn, exec, execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const http = require('http')
const net = require('net')
const os = require('os')

const config = {
    ports: { api: 3000, frontend: 5173, qdrant: 6333 },
    docker: {
        qdrantComposeFile: 'docker-compose-qdrant.yml',
        healthCheckTimeout: 30000,
        healthCheckInterval: 1000,
    },
    colors: {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        api: '\x1b[36m',
        frontend: '\x1b[35m',
        docker: '\x1b[34m',
        error: '\x1b[31m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        info: '\x1b[37m',
    },
}

const args = process.argv.slice(2)
const options = {
    skipDocker: args.includes('--skip-docker'),
    apiOnly: args.includes('--api-only'),
    frontendOnly: args.includes('--frontend-only'),
    help: args.includes('--help'),
}

function log(msg, type = 'info') {
    const time = new Date().toLocaleTimeString()
    const color = config.colors[type] || config.colors.info
    console.log(
        `${config.colors.dim}[${time}]${config.colors.reset} ${color}${msg}${config.colors.reset}`
    )
}

function showHelp() {
    console.log(
        `\n${config.colors.bright}Drew Clark Portfolio Dev Environment${config.colors.reset}\n`
    )
    console.log(
        `Usage: node dev-start.js [--skip-docker|--api-only|--frontend-only|--help]\n`
    )
    process.exit(0)
}

function execPromise(cmd) {
    return new Promise((res, rej) =>
        exec(cmd, (err, out) => (err ? rej(err) : res(out.trim())))
    )
}

/**
 * Attempt to locate an executable in node_modules/.bin or fallback.
 */
function findNodeModulesBin(executable) {
    const isWindows = os.platform() === 'win32'
    const ext = isWindows ? '.cmd' : ''
    const possiblePaths = [
        path.join(process.cwd(), 'node_modules', '.bin', executable + ext),
        path.join(
            process.cwd(),
            'node_modules',
            executable,
            'bin',
            executable + ext
        ),
    ]
    for (const binPath of possiblePaths) {
        if (fs.existsSync(binPath)) {
            return binPath
        }
    }
    return null
}

async function isPortInUse(port) {
    return new Promise(resolve => {
        const server = net.createServer()
        server.once('error', () => resolve(true))
        server.once('listening', () => {
            server.close()
            resolve(false)
        })
        server.listen(port)
    })
}

async function killPorts(ports) {
    for (const port of ports) {
        try {
            if (os.platform() === 'win32') {
                execSync(`npx kill-port ${port}`)
            } else {
                const pid = execSync(`lsof -t -i:${port}`).toString().trim()
                if (pid) execSync(`kill -9 ${pid}`)
            }
            log(`Freed port ${port}`, 'success')
        } catch {
            log(`No process on port ${port}`, 'info')
        }
    }
}

async function checkDocker() {
    try {
        await execPromise('docker ps')
        return true
    } catch {
        log('Docker not available', 'warning')
        return false
    }
}

async function isQdrantRunning() {
    try {
        const out = await execPromise(
            'docker ps --filter "name=qdrant" --format "{{.Names}}"'
        )
        return out.includes('qdrant')
    } catch {
        return false
    }
}

async function startQdrant() {
    if (!fs.existsSync(config.docker.qdrantComposeFile)) {
        log('Missing docker-compose-qdrant.yml', 'error')
        return
    }
    if (await isQdrantRunning()) {
        return log('Qdrant already running', 'success')
    }

    await execPromise(
        `docker-compose -f ${config.docker.qdrantComposeFile} up -d`
    )
    log('Started Qdrant', 'success')
    await waitForHealth()
}

async function waitForHealth() {
    const start = Date.now()
    const endpoints = ['/healthz', '/health', '/']
    while (Date.now() - start < config.docker.healthCheckTimeout) {
        for (const ep of endpoints) {
            try {
                await new Promise((res, rej) => {
                    const req = http.get(
                        `http://localhost:${config.ports.qdrant}${ep}`,
                        { timeout: 3000 },
                        res
                    )
                    req.on('response', r =>
                        r.statusCode >= 200 && r.statusCode < 300
                            ? res()
                            : rej()
                    )
                    req.on('error', rej)
                    req.on('timeout', () => req.destroy())
                    req.end()
                })
                return log('Qdrant healthy', 'success')
            } catch {}
        }
        process.stdout.write('.')
        await new Promise(r => setTimeout(r, config.docker.healthCheckInterval))
    }
    log('Qdrant health check timed out', 'warning')
}

function startApi() {
    const nodemonPath = findNodeModulesBin('nodemon') || 'nodemon'
    const proc = spawn(nodemonPath, ['server.js'], {
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: true },
    })
    pipeLogs(proc, 'API')
    return proc
}

function startFrontend() {
    const cmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm'
    const proc = spawn(cmd, ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'app'),
        stdio: 'pipe',
        env: process.env,
    })
    pipeLogs(proc, 'Frontend')
    return proc
}

function pipeLogs(proc, label) {
    proc.stdout.on('data', d => {
        process.stdout.write(
            `${config.colors[label.toLowerCase()] || ''}[${label}] ${
                config.colors.reset
            }${d}`
        )
    })
    proc.stderr.on('data', d => {
        process.stderr.write(
            `${config.colors.error}[${label} ERROR] ${config.colors.reset}${d}`
        )
    })
}

;(async () => {
    if (options.help) {
        showHelp()
        return
    }

    const ports = []
    if (!options.frontendOnly) ports.push(config.ports.api)
    if (!options.apiOnly) ports.push(config.ports.frontend)

    await killPorts(ports)

    if (!options.skipDocker && (await checkDocker())) {
        await startQdrant()
    } else if (!options.skipDocker) {
        log('Skipping Qdrant startup', 'warning')
    }

    const processes = []
    if (!options.frontendOnly) {
        processes.push(startApi())
    }
    if (!options.apiOnly) {
        setTimeout(() => {
            processes.push(startFrontend())
        }, 2000)
    }

    process.on('SIGINT', () => {
        log('Shutting down...', 'info')
        processes.forEach(p => {
            if (p && !p.killed) {
                p.kill()
            }
        })
        process.exit(0)
    })
})()

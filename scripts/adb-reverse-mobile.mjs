import { execSync } from 'node:child_process'

const PORTS = [5173, 4000]

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

try {
  run('adb version')
} catch {
  console.error('\n[mobile] adb not found.')
  console.error('Install Android Platform Tools: https://developer.android.com/tools/releases/platform-tools')
  console.error('Then enable USB debugging on your phone and connect via USB.\n')
  process.exit(1)
}

const devices = run('adb devices')
  .split('\n')
  .slice(1)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('*') && line.endsWith('device'))

if (devices.length === 0) {
  console.error('\n[mobile] No Android device found.')
  console.error('1. Connect phone with USB cable')
  console.error('2. Enable Developer options -> USB debugging')
  console.error('3. Accept the debugging prompt on the phone')
  console.error('4. Run: adb devices\n')
  process.exit(1)
}

for (const port of PORTS) {
  run(`adb reverse tcp:${port} tcp:${port}`)
  console.log(`[mobile] phone localhost:${port} -> PC localhost:${port}`)
}

console.log('\n[mobile] Open on your phone: http://localhost:5173')
console.log('[mobile] Google login works too (uses localhost:4000 callback).\n')

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Pick e2e login email from env or instituteofsound-api SUPER_ADMIN_EMAIL. */
export default function globalSetup() {
  if (process.env.SEQUENCE_E2E_EMAIL?.trim()) return

  const apiEnvPath = resolve(process.cwd(), '../instituteofsound-api/.env')
  if (!existsSync(apiEnvPath)) return

  const match = readFileSync(apiEnvPath, 'utf8').match(/^SUPER_ADMIN_EMAIL=(.+)$/m)
  const email = match?.[1]?.trim()
  if (email) {
    process.env.SEQUENCE_E2E_EMAIL = email
  }
}

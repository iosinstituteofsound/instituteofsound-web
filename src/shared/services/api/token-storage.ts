const ACCESS_KEY = 'ios_access_token'
const REFRESH_KEY = 'ios_refresh_token'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
    sessionStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return read(ACCESS_KEY)
  },

  getRefreshToken(): string | null {
    return read(REFRESH_KEY)
  },

  setTokens(accessToken: string, refreshToken: string): void {
    write(ACCESS_KEY, accessToken)
    write(REFRESH_KEY, refreshToken)
  },

  clear(): void {
    remove(ACCESS_KEY)
    remove(REFRESH_KEY)
  },

  hasSession(): boolean {
    return Boolean(this.getAccessToken() || this.getRefreshToken())
  },
}

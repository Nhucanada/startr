import { vanillaTrpcClient } from '../utils/trpcClient.js'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  password_confirm: string
}

export interface User {
  id: string
  email: string
}

class AuthService {
  private refreshInterval: number | null = null
  private readonly TOKEN_REFRESH_INTERVAL = 4.5 * 60 * 1000 // 4.5 minutes (refresh before 5min expiry)

  async login(credentials: LoginCredentials) {
    const data = await vanillaTrpcClient.user.login.mutate({
      email: credentials.email,
      password: credentials.password,
    })

    if (data.session) {
      this.storeSession(data.session)
      this.startTokenRefresh()
    }

    return { session: data.session }
  }

  async register(credentials: RegisterCredentials) {
    const data = await vanillaTrpcClient.user.register.mutate({
      email: credentials.email,
      password: credentials.password,
    })

    if (data.session) {
      this.storeSession(data.session)
      this.startTokenRefresh()
    }

    return { user: data.user, session: data.session }
  }

  async logout() {
    this.stopTokenRefresh()
    try {
      await vanillaTrpcClient.user.logout.mutate()
    } catch (error) {
      // Server may return empty response, ignore parsing errors
      console.warn('[AuthService] Logout server call failed:', error)
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('token_timestamp')
  }

  private storeSession(session: any) {
    localStorage.setItem('auth_token', session.access_token)
    localStorage.setItem('refresh_token', session.refresh_token)
    localStorage.setItem('user', JSON.stringify({ id: session.user.id, email: session.user.email }))
    localStorage.setItem('token_timestamp', Date.now().toString())
  }

  private startTokenRefresh() {
    this.stopTokenRefresh() // Clear any existing interval

    this.refreshInterval = window.setInterval(async () => {
      await this.refreshToken()
    }, this.TOKEN_REFRESH_INTERVAL)

    console.log('[AuthService] Token refresh started, will refresh every', this.TOKEN_REFRESH_INTERVAL / 60000, 'minutes')
  }

  private stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
      console.log('[AuthService] Token refresh stopped')
    }
  }

  private async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      console.warn('[AuthService] No refresh token found, cannot refresh')
      return
    }

    try {
      console.log('[AuthService] Refreshing token...')
      const data = await vanillaTrpcClient.user.token.mutate({
        refreshToken: refreshToken
      })

      if (data.session) {
        this.storeSession(data.session)
        console.log('[AuthService] Token refreshed successfully')
      }
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error)
      // If refresh fails, logout user
      this.logout()
      // Optionally redirect to login or show login modal
      window.location.reload()
    }
  }

  async resetPassword(email: string) {
    await vanillaTrpcClient.user.password.reset.mutate({ email })
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  // Initialize auth service - start token refresh if user is already logged in
  init() {
    if (this.isAuthenticated()) {
      // Check if token is close to expiry
      const timestamp = localStorage.getItem('token_timestamp')
      if (timestamp) {
        const tokenAge = Date.now() - parseInt(timestamp)
        const shouldRefresh = tokenAge > this.TOKEN_REFRESH_INTERVAL

        if (shouldRefresh) {
          // Token is close to expiry, refresh immediately
          this.refreshToken()
        }
      }

      // Start regular refresh interval
      this.startTokenRefresh()
      console.log('[AuthService] Initialized with existing session')
    }
  }
}

export const authService = new AuthService()

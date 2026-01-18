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
  async login(credentials: LoginCredentials) {
    const data = await vanillaTrpcClient.user.login.mutate({
      email: credentials.email,
      password: credentials.password,
    })

    if (data.session) {
      localStorage.setItem('auth_token', data.session.access_token)
      localStorage.setItem('user', JSON.stringify({ id: data.session.user.id, email: data.session.user.email }))
    }

    return { session: data.session }
  }

  async register(credentials: RegisterCredentials) {
    const data = await vanillaTrpcClient.user.register.mutate({
      email: credentials.email,
      password: credentials.password,
    })

    if (data.session) {
      localStorage.setItem('auth_token', data.session.access_token)
      localStorage.setItem('user', JSON.stringify({ id: data.user?.id, email: data.user?.email }))
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
    localStorage.removeItem('user')
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
}

export const authService = new AuthService()

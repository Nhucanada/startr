import { supabaseClient } from '../lib/supabaseClient.js'

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
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) throw new Error(error.message)

    // Store token for tRPC client
    localStorage.setItem('auth_token', data.session.access_token)
    localStorage.setItem('user', JSON.stringify({ id: data.user.id, email: data.user.email }))

    return { user: data.user, session: data.session }
  }

  async register(credentials: RegisterCredentials) {
    const { data, error } = await supabaseClient.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) throw new Error(error.message)

    if (data.session) {
      localStorage.setItem('auth_token', data.session.access_token)
      localStorage.setItem('user', JSON.stringify({ id: data.user?.id, email: data.user?.email }))
    }

    return { user: data.user, session: data.session }
  }

  async logout() {
    await supabaseClient.auth.signOut()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  async resetPassword(email: string) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email)
    if (error) throw new Error(error.message)
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

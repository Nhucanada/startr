const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const DEMO_MODE = !import.meta.env.VITE_API_BASE_URL // Enable demo mode when no API URL is set
const AUTH_PLACEHOLDER = import.meta.env.VITE_AUTH_PLACEHOLDER === 'true'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  password_confirm: string
}

export interface User {
  id: number
  username: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface PasswordResetRequest {
  email: string
}

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (DEMO_MODE || AUTH_PLACEHOLDER) {
      // Demo mode - simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay

      const demoUser: User = {
        id: 1,
        username: credentials.username,
        email: `${credentials.username}@example.com`
      }

      const demoResponse: AuthResponse = {
        token: 'demo-token-' + Date.now(),
        user: demoUser
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', demoResponse.token)
      localStorage.setItem('user', JSON.stringify(demoResponse.user))

      return demoResponse
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login failed')
      }

      const data: AuthResponse = await response.json()

      // Store token in localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.')
      }
      throw error
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (DEMO_MODE || AUTH_PLACEHOLDER) {
      // Demo mode - simulate successful registration
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay

      const demoUser: User = {
        id: 2,
        username: credentials.username,
        email: credentials.email
      }

      const demoResponse: AuthResponse = {
        token: 'demo-token-' + Date.now(),
        user: demoUser
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', demoResponse.token)
      localStorage.setItem('user', JSON.stringify(demoResponse.user))

      return demoResponse
    }

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Registration failed')
    }

    const data: AuthResponse = await response.json()

    // Store token in localStorage
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    return data
  }

  async logout(): Promise<void> {
    if (DEMO_MODE || AUTH_PLACEHOLDER) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      return
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      })
    } finally {
      // Always clear local storage, even if the API call fails
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  async getUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/token/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data: AuthResponse = await response.json()
    localStorage.setItem('auth_token', data.token)

    return data
  }

  async resetPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/password/reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Password reset failed')
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('user')
    return !!(token && user)
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

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

export const authService = new AuthService()
import React, { useState } from 'react'
import { Box, Typography, TextField, Button, Tabs, Tab, Alert, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EmailIcon from '@mui/icons-material/Email'
import { authService, LoginCredentials, RegisterCredentials } from '../services/auth.js'
import { useLogin } from '../hooks/useLogin.js'

const Overlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: '#1A1A1A',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000,
})

const LoginFrame = styled(Box)({
  width: '390px',
  height: '844px',
  maxWidth: '100vw',
  maxHeight: '100vh',
  aspectRatio: '9/16',
  backgroundColor: '#1A1B4B',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const LoginContainer = styled(Box)({
  width: '100%',
  height: '100%',
  maxWidth: '100%',
  maxHeight: '100%',
  backgroundColor: '#1A1B4B',
  borderRadius: '24px',
  padding: '32px 24px',
  display: 'flex',
  flexDirection: 'column',
})

const AppTitle = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '32px',
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: '8px',
})

const AppSubtitle = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '300',
  textAlign: 'center',
  opacity: 0.8,
  marginBottom: '32px',
})

const StyledTabs = styled(Tabs)({
  marginBottom: '24px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#5B5F9E',
  },
})

const StyledTab = styled(Tab)({
  color: '#FFFFFF',
  textTransform: 'none',
  fontSize: '16px',
  '&.Mui-selected': {
    color: '#5B5F9E',
  },
})

const StyledTextField = styled(TextField)({
  marginBottom: '16px',
  '& .MuiInputBase-root': {
    color: '#FFFFFF',
    backgroundColor: '#1A1B4B',
    borderRadius: '8px',
  },
  '& .MuiInputLabel-root': {
    color: '#FFFFFF',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#5B5F9E',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#6B6FAE',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#5B5F9E',
  },
})

const SubmitButton = styled(Button)({
  backgroundColor: '#5B5F9E',
  color: '#FFFFFF',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '16px',
  padding: '12px 24px',
  marginTop: '8px',
  '&:hover': {
    backgroundColor: '#6B6FAE',
  },
  '&:disabled': {
    backgroundColor: '#3A3E6A',
    color: '#8A8A8A',
  },
})

const ForgotPasswordButton = styled(Button)({
  color: '#5B5F9E',
  textTransform: 'none',
  fontSize: '14px',
  marginTop: '8px',
  '&:hover': {
    backgroundColor: 'rgba(91, 95, 158, 0.1)',
  },
})

interface LoginOverlayProps {
  onLoginSuccess: () => void
}

export default function LoginOverlay({ onLoginSuccess }: LoginOverlayProps) {
  const [currentTab, setCurrentTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading: loginLoading } = useLogin()

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({
    email: '',
    password: '',
    password_confirm: '',
  })

  // Password reset state
  const [resetEmail, setResetEmail] = useState('')
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
    setError('')
  }

  const handleLogin = async () => {
    if (!loginForm.email.trim() || !loginForm.password) {
      setError('Please fill in all fields')
      return
    }

    setError('')

    try {
      await login(loginForm.email, loginForm.password)
      onLoginSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleRegister = async () => {
    if (!registerForm.email.trim() || !registerForm.password || !registerForm.password_confirm) {
      setError('Please fill in all fields')
      return
    }

    if (registerForm.password !== registerForm.password_confirm) {
      setError('Passwords do not match')
      return
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.register(registerForm)
      onLoginSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.resetPassword(resetEmail)
      setShowPasswordReset(false)
      setResetEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (showPasswordReset) {
    return (
      <Overlay>
        <LoginFrame>
          <LoginContainer>
            <AppTitle>Reset Password</AppTitle>
            <AppSubtitle>Enter your email to receive reset instructions</AppSubtitle>

            {error && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: '#4A3A3A' }}>
                {error}
              </Alert>
            )}


            <StyledTextField
              fullWidth
              type="email"
              label="Email Address"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: '#FFFFFF', mr: 1 }} />,
              }}
            />

            <SubmitButton
              fullWidth
              onClick={handlePasswordReset}
              disabled={loading || !resetEmail.trim()}
            >
              {loading ? <CircularProgress size={20} /> : 'Send Reset Email'}
            </SubmitButton>

            <ForgotPasswordButton
              fullWidth
              onClick={() => {
                setShowPasswordReset(false)
                setError('')
              }}
              disabled={loading}
            >
              Back to Login
            </ForgotPasswordButton>
          </LoginContainer>
        </LoginFrame>
      </Overlay>
    )
  }

  return (
    <Overlay>
      <LoginFrame>
        <LoginContainer>
          <AppTitle>Startr</AppTitle>
          <AppSubtitle>Your habit tracking companion</AppSubtitle>

          <StyledTabs value={currentTab} onChange={handleTabChange}>
            <StyledTab
              icon={<LockOutlinedIcon />}
              label="Login"
              iconPosition="start"
            />
            <StyledTab
              icon={<PersonAddIcon />}
              label="Register"
              iconPosition="start"
            />
          </StyledTabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: '#4A3A3A' }}>
              {error}
            </Alert>
          )}


          {currentTab === 0 ? (
            // Login Tab
            <>
              <StyledTextField
                fullWidth
                type="email"
                label="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                disabled={loginLoading}
              />

              <StyledTextField
                fullWidth
                type="password"
                label="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={loginLoading}
              />

              <SubmitButton
                fullWidth
                onClick={handleLogin}
                disabled={loginLoading || !loginForm.email.trim() || !loginForm.password}
              >
                {loginLoading ? <CircularProgress size={20} /> : 'Login'}
              </SubmitButton>

              <ForgotPasswordButton
                fullWidth
                onClick={() => {
                  setShowPasswordReset(true)
                  setError('')
                }}
                disabled={loading}
              >
                Forgot Password?
              </ForgotPasswordButton>
            </>
          ) : (
            // Register Tab
            <>
              <StyledTextField
                fullWidth
                type="email"
                label="Email Address"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                disabled={loading}
              />

              <StyledTextField
                fullWidth
                type="password"
                label="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                disabled={loading}
              />

              <StyledTextField
                fullWidth
                type="password"
                label="Confirm Password"
                value={registerForm.password_confirm}
                onChange={(e) => setRegisterForm({ ...registerForm, password_confirm: e.target.value })}
                disabled={loading}
              />

              <SubmitButton
                fullWidth
                onClick={handleRegister}
                disabled={loading || !registerForm.email.trim() ||
                          !registerForm.password || !registerForm.password_confirm}
              >
                {loading ? <CircularProgress size={20} /> : 'Create Account'}
              </SubmitButton>
            </>
          )}
        </LoginContainer>
      </LoginFrame>
    </Overlay>
  )
}
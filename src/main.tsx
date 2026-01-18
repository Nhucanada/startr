import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClientProvider } from '@tanstack/react-query'
import { trpc } from './utils/trpc.js'
import { trpcClient, queryClient } from './utils/trpcClient.js'
import { authService } from './services/auth.js'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: '"Jersey 25", cursive',
  },
})

// Initialize auth service on app start
authService.init()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>,
)
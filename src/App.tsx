import { useState } from 'react'
import { Container, Typography, Box, Button, AppBar, Toolbar, TextField, CircularProgress, Alert } from '@mui/material'
import { styled } from '@mui/material/styles'
import { trpc } from './utils/trpc'

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const users = trpc.getUsers.useQuery()
  const createUserMutation = trpc.createUser.useMutation({
    onSuccess: () => {
      users.refetch()
      setName('')
      setEmail('')
    }
  })

  const handleCreateUser = async () => {
    if (name && email) {
      createUserMutation.mutate({ name, email })
    }
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Startr with tRPC & Supabase
          </Typography>
        </Toolbar>
      </AppBar>

      <StyledContainer maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 4,
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Startr
          </Typography>

          <Typography variant="h5" component="p" color="textSecondary" paragraph>
            A modern React TypeScript application with tRPC and Supabase
          </Typography>

          <Box sx={{ mt: 4, width: '100%', maxWidth: 400 }}>
            <Typography variant="h4" gutterBottom>
              Create User
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending || !name || !email}
              sx={{ mb: 4 }}
            >
              {createUserMutation.isPending ? <CircularProgress size={24} /> : 'Create User'}
            </Button>

            {createUserMutation.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createUserMutation.error.message}
              </Alert>
            )}
          </Box>

          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <Typography variant="h4" gutterBottom>
              Users
            </Typography>

            {users.isLoading && <CircularProgress />}
            {users.error && (
              <Alert severity="error">
                {users.error.message}
              </Alert>
            )}
            {users.data && (
              <Box>
                {users.data.length === 0 ? (
                  <Typography color="textSecondary">
                    No users found. Create one above!
                  </Typography>
                ) : (
                  users.data.map((user: { id: string; name: string; email: string }) => (
                    <Box key={user.id} sx={{ p: 2, border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography color="textSecondary">{user.email}</Typography>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Box>
      </StyledContainer>
    </>
  )
}

export default App
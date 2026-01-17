import React from 'react'
import { Container, Typography, Box, Button, AppBar, Toolbar } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Startr
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
            A modern React TypeScript application with Material-UI
          </Typography>

          <Button variant="contained" size="large" sx={{ mt: 2 }}>
            Get Started
          </Button>
        </Box>
      </StyledContainer>
    </>
  )
}

export default App
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

const Container = styled(Box)({
  height: '100%',
  padding: '60px 32px 100px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
})

const Title = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '32px',
  fontWeight: '300',
  textAlign: 'center',
})

const Subtitle = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: '300',
  opacity: 0.7,
  marginTop: '16px',
  textAlign: 'center',
})

export default function NewPageContent() {
  return (
    <Container>
      <Title>New Page</Title>
      <Subtitle>Swipe right to go home</Subtitle>
    </Container>
  )
}

import { Box, Typography, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Button3D from './Button3D.js'

const Container = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingBottom: '80px',
  padding: '32px',
})

const Title = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '32px',
  fontWeight: '700',
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '8px',
})

const Description = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '400',
  textAlign: 'center',
  opacity: 0.8,
  lineHeight: '1.5',
  maxWidth: '280px',
})

const LogoutButton = styled(Button)({
  position: 'absolute',
  top: '32px',
  right: '32px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#FFFFFF',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '14px',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
})

const UserInfo = styled(Typography)({
  position: 'absolute',
  top: '32px',
  left: '32px',
  color: '#FFFFFF',
  fontSize: '14px',
  opacity: 0.8,
})

interface ButtonPageContentProps {
  onButtonClick: () => void
  onLogout: () => void
}

export default function ButtonPageContent({ onButtonClick, onLogout }: ButtonPageContentProps) {
  const handleLogout = async () => {
    await onLogout()
  }

  return (
    <Container>
      <LogoutButton
        startIcon={<ExitToAppIcon />}
        onClick={handleLogout}
      >
        Logout
      </LogoutButton>

      <Button3D onClick={onButtonClick} />
      <Title>Panic Button</Title>
      <Description>
        Struggling to stick to your habits? When motivation is low and you need that extra push, click here for instant motivation and accountability.
      </Description>
    </Container>
  )
}

import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import Button3D from './Button3D.js'
import LockIcon from '@mui/icons-material/Lock'

const AppContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#1A1A1A',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
})

const MobileFrame = styled(Box)({
  width: '390px',
  height: '844px',
  maxWidth: '100vw',
  maxHeight: '100vh',
  aspectRatio: '9/16',
  background: 'linear-gradient(180deg, #4A4E7A 0%, #3A3E6A 50%, #2A2E5A 100%)',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
})

const LockContainer = styled(Box)({
  position: 'absolute',
  bottom: '40px',
  right: '40px',
})

const StyledLockIcon = styled(LockIcon)({
  color: '#D4AF37',
  fontSize: '32px',
  cursor: 'pointer',
})

interface ButtonPageProps {
  onBackClick: () => void
  onButtonClick: () => void
}

export default function ButtonPage({ onBackClick, onButtonClick }: ButtonPageProps) {
  return (
    <AppContainer>
      <MobileFrame>
        <Button3D onClick={onButtonClick} />

        <LockContainer>
          <StyledLockIcon onClick={onBackClick} />
        </LockContainer>
      </MobileFrame>
    </AppContainer>
  )
}
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import Button3D from './Button3D.js'
import BottomNav from './BottomNav.js'

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

interface ButtonPageProps {
  onButtonClick: () => void
  onNavigate: (page: 'home' | 'button') => void
}

export default function ButtonPage({ onButtonClick, onNavigate }: ButtonPageProps) {
  return (
    <AppContainer>
      <MobileFrame>
        <Button3D onClick={onButtonClick} />
        <BottomNav currentPage="button" onNavigate={onNavigate} />
      </MobileFrame>
    </AppContainer>
  )
}
import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
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
  background: 'linear-gradient(180deg, #4A4E7A 0%, #2E3267 50%, #1A1B4B 100%)',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  position: 'relative',
})

const GradientContainer = styled(Box)({
  height: '100%',
  padding: '60px 32px 100px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
})

const StreakContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '60px',
})

const StreakText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '48px',
  fontWeight: '300',
  lineHeight: '1.2',
})

const StreakSubText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '24px',
  fontWeight: '300',
  opacity: 0.9,
})

const FireEmoji = styled('span')({
  fontSize: '64px',
  marginLeft: '20px',
})

const HabitCard = styled(Box)({
  backgroundColor: '#5B5F9E',
  borderRadius: '24px',
  padding: '24px',
  marginBottom: '24px',
  minHeight: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const CheckboxContainer = styled(Box)<{ checked: boolean }>(({ checked }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: checked ? '#7FD4A3' : 'rgba(255,255,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  flexShrink: 0,
}))

const EmptyHabitCard = styled(Box)({
  backgroundColor: '#4A4E7A',
  borderRadius: '24px',
  padding: '24px',
  marginBottom: '24px',
  minHeight: '80px',
  opacity: 0.6,
})

const HabitText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '20px',
  fontWeight: '400',
})

interface HabitTrackerProps {
  onNavigate: (page: 'home' | 'button') => void
}

export default function HabitTracker({ onNavigate }: HabitTrackerProps) {
  const [isChecked, setIsChecked] = useState(false)

  const handleCheckboxClick = () => {
    setIsChecked(!isChecked)
  }

  return (
    <AppContainer>
      <MobileFrame>
        <GradientContainer>
          <StreakContainer>
            <Box>
              <StreakText>{isChecked ? 1 : 0}</StreakText>
              <StreakSubText>tasks completed!</StreakSubText>
            </Box>
            <FireEmoji>🔥</FireEmoji>
          </StreakContainer>

          <Box sx={{ flex: 1 }}>
            <HabitCard>
              <HabitText>Make the bed</HabitText>
              <CheckboxContainer checked={isChecked} onClick={handleCheckboxClick}>
                {isChecked && <CheckIcon sx={{ color: '#FFFFFF', fontSize: '28px' }} />}
              </CheckboxContainer>
            </HabitCard>

            <EmptyHabitCard />
            <EmptyHabitCard />
          </Box>
        </GradientContainer>
        <BottomNav currentPage="home" onNavigate={onNavigate} />
      </MobileFrame>
    </AppContainer>
  )
}
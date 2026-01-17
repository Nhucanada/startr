import { useState } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import SwipeablePages, { PageType } from './components/SwipeablePages.js'
import NewPageContent from './components/NewPageContent.js'
import HabitTrackerContent from './components/HabitTrackerContent.js'
import ButtonPageContent from './components/ButtonPageContent.js'
import BottomNav from './components/BottomNav.js'
import CameraPopup from './components/CameraPopup.js'

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

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [showCameraPopup, setShowCameraPopup] = useState(false)

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
  }

  const handleButtonClick = () => {
    setShowCameraPopup(true)
  }

  const handleCloseCameraPopup = () => {
    setShowCameraPopup(false)
  }

  return (
    <>
      <AppContainer>
        <MobileFrame>
          <SwipeablePages currentPage={currentPage} onPageChange={handleNavigate}>
            <NewPageContent />
            <HabitTrackerContent />
            <ButtonPageContent onButtonClick={handleButtonClick} />
          </SwipeablePages>
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </MobileFrame>
      </AppContainer>

      {showCameraPopup && (
        <CameraPopup onClose={handleCloseCameraPopup} />
      )}
    </>
  )
}

export default App

import { useState, useRef } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import SwipeablePages, { PageType } from './components/SwipeablePages.js'
import NewPageContent from './components/NewPageContent.js'
import HabitTrackerContent from './components/HabitTrackerContent.js'
import ButtonPageContent from './components/ButtonPageContent.js'
import BottomNav from './components/BottomNav.js'
import CameraPopup from './components/CameraPopup.js'
import CreateTaskPopup from './components/CreateTaskPopup.js'

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
  const [showCreateTaskPopup, setShowCreateTaskPopup] = useState(false)
  const createTaskCallbackRef = useRef<((title: string) => void) | null>(null)

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
  }

  const handleButtonClick = () => {
    setShowCameraPopup(true)
  }

  const handleCloseCameraPopup = () => {
    setShowCameraPopup(false)
  }

  const handleOpenCreateTask = (callback: (title: string) => void) => {
    createTaskCallbackRef.current = callback
    setShowCreateTaskPopup(true)
  }

  const handleCreateTask = (title: string) => {
    if (createTaskCallbackRef.current) {
      createTaskCallbackRef.current(title)
    }
  }

  const handleCloseCreateTask = () => {
    setShowCreateTaskPopup(false)
    createTaskCallbackRef.current = null
  }

  return (
    <>
      <AppContainer>
        <MobileFrame>
          <SwipeablePages currentPage={currentPage} onPageChange={handleNavigate}>
            <NewPageContent />
            <HabitTrackerContent onOpenCreateTask={handleOpenCreateTask} />
            <ButtonPageContent onButtonClick={handleButtonClick} />
          </SwipeablePages>
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </MobileFrame>
      </AppContainer>

      {showCameraPopup && (
        <CameraPopup onClose={handleCloseCameraPopup} />
      )}

      {showCreateTaskPopup && (
        <CreateTaskPopup
          onClose={handleCloseCreateTask}
          onCreateTask={handleCreateTask}
        />
      )}
    </>
  )
}

export default App

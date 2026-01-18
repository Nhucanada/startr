import { useState, useRef } from 'react'
import { Box, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import SwipeablePages, { PageType } from './components/SwipeablePages.js'
import HabitTrackerContent from './components/HabitTrackerContent.js'
import ButtonPageContent from './components/ButtonPageContent.js'
import BottomNav from './components/BottomNav.js'
import CameraPopup from './components/CameraPopup.js'
import CreateTaskPopup from './components/CreateTaskPopup.js'
import AIResponsePopup, { AIResponsePayload } from './components/AIResponsePopup.js'
import LoginOverlay from './components/LoginOverlay.js'
import { authService } from './services/auth.js'

import { trpc } from './utils/trpc.js'

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
  backgroundColor: '#1A1B4B',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  position: 'relative',
})

const TopLogoutButton = styled(Button)({
  position: 'absolute',
  top: '16px',
  right: '16px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#FFFFFF',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '14px',
  padding: '8px 16px',
  zIndex: 2,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
})

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [showCameraPopup, setShowCameraPopup] = useState(false)
  const [panicHabitId, setPanicHabitId] = useState<string | null>(null)
  const [showCreateTaskPopup, setShowCreateTaskPopup] = useState(false)
  const [showAiResponsePopup, setShowAiResponsePopup] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponsePayload | null>(null)
  const [showLoginOverlay, setShowLoginOverlay] = useState(!authService.isAuthenticated())
  const [emphasisActive, setEmphasisActive] = useState(false)
  const resetPanicModeRef = useRef<(() => void) | null>(null)

  const utils = trpc.useUtils()

  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      utils.habits.getUserHabits.invalidate()
    },
  })
  
  const handleLogout = async () => {
    await authService.logout()
    setCurrentPage('home')
    setShowLoginOverlay(true)
  }

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
  }

  const handleButtonClick = (habitId?: string) => {
    setPanicHabitId(habitId || null)
    setShowCameraPopup(true)
  }

  const handleCloseCameraPopup = () => {
    setShowCameraPopup(false)
    setPanicHabitId(null)
    // Reset panic mode when camera popup closes
    if (resetPanicModeRef.current) {
      resetPanicModeRef.current()
    }
  }

  const handleOpenCreateTask = () => {
    setShowCreateTaskPopup(true)
  }

  const handleAiSubmit = async (prompt: string) => {
    try {
      const result = await createHabitMutation.mutateAsync({ name: prompt })
      const plan = result?.plan as { steps?: string[]; fun_fact?: string } | undefined
      const responsePayload: AIResponsePayload = {
        prompt,
        response: plan?.fun_fact || `I created a goal plan for "${prompt}".`,
        suggestions: plan?.steps ?? [],
      }
      setAiResponse(responsePayload)
      setShowAiResponsePopup(true)
    } catch (error) {
      console.error('Failed to create AI habit:', error)
      setAiResponse({
        prompt,
        response: 'Sorry, I could not generate a response right now. Please try again.',
        suggestions: [],
      })
      setShowAiResponsePopup(true)
    }
  }

  const handleCloseCreateTask = () => {
    setShowCreateTaskPopup(false)
  }


  return (
    <>
      {showLoginOverlay && (
        <LoginOverlay
          onLoginSuccess={() => {
            setCurrentPage('home')
            setTimeout(() => setShowLoginOverlay(false), 150)
          }}
        />
      )}
      <AppContainer>
        <MobileFrame>
          {!showLoginOverlay && (
            <TopLogoutButton
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              sx={{
                pointerEvents: emphasisActive ? 'none' : 'auto',
                opacity: emphasisActive ? 0.4 : 1,
              }}
            >
              Logout
            </TopLogoutButton>
          )}
          <SwipeablePages currentPage={currentPage} onPageChange={handleNavigate}>
            <HabitTrackerContent
              onOpenCreateTask={handleOpenCreateTask}
              onPanic={handleButtonClick}
              onEmphasisChange={setEmphasisActive}
              resetPanicModeRef={resetPanicModeRef}
            />
            <ButtonPageContent onButtonClick={handleButtonClick} />
          </SwipeablePages>
          <Box
            sx={{
              pointerEvents: emphasisActive ? 'none' : 'auto',
              opacity: emphasisActive ? 0.4 : 1,
            }}
          >
            <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
          </Box>
        </MobileFrame>
      </AppContainer>

      {showCameraPopup && (
        <CameraPopup onClose={handleCloseCameraPopup} habitId={panicHabitId || undefined} />
      )}

      {showCreateTaskPopup && (
        <CreateTaskPopup
          onClose={handleCloseCreateTask}
          onAiSubmit={handleAiSubmit}
        />
      )}

      {showAiResponsePopup && aiResponse && (
        <AIResponsePopup
          response={aiResponse}
          onClose={() => setShowAiResponsePopup(false)}
        />
      )}

    </>
  )
}

export default App

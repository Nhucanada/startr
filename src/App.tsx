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

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  streak: number
}

interface AIResponse {
  prompt: string
  response: string
  suggestions: string[]
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [showCameraPopup, setShowCameraPopup] = useState(false)
  const [showCreateTaskPopup, setShowCreateTaskPopup] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [aiResponse, setAiResponse] = useState<AIResponse | undefined>()
  const [showLoginOverlay, setShowLoginOverlay] = useState(!authService.isAuthenticated())
  const createTaskCallbackRef = useRef<((title: string, description?: string) => void) | null>(null)
  const toggleTaskCallbackRef = useRef<((taskId: string) => void) | null>(null)

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

    // Reset state when leaving the 'new' page, but wait for animation to complete
    if (currentPage === 'new' && page !== 'new') {
      setTimeout(() => {
        setSelectedTask(undefined)
        setAiResponse(undefined)
      }, 300) // Match the 0.3s animation duration
    }
  }

  const handleButtonClick = () => {
    setShowCameraPopup(true)
  }

  const handleCloseCameraPopup = () => {
    setShowCameraPopup(false)
  }

  const handleOpenCreateTask = (callback: (title: string, description?: string) => void) => {
    createTaskCallbackRef.current = callback
    setShowCreateTaskPopup(true)
  }

  const handleSelectTask = (task: Task, toggleCallback: (taskId: string) => void) => {
    setSelectedTask(task)
    setAiResponse(undefined) // Clear AI response when selecting a task
    toggleTaskCallbackRef.current = toggleCallback
    setCurrentPage('new')
  }

  const handleAiSubmit = async (prompt: string) => {
    // Create the habit using the backend
    try {
      const result = await createHabitMutation.mutateAsync({ description: prompt })

      // Transform the backend response into AIResponse format for display
      const plan = result.plan as { title?: string; frequency?: string; steps?: string[]; fun_fact?: string } | null
      const aiResult: AIResponse = {
        prompt,
        response: plan?.fun_fact || `Great! I've created a habit plan for "${prompt}". Here are some steps to help you succeed:`,
        suggestions: plan?.steps || [
          'Start with 5 minutes daily',
          'Set a specific time each day',
          'Track your progress weekly'
        ]
      }

      setAiResponse(aiResult)
      setSelectedTask(undefined)
      setCurrentPage('new')
    } catch (error) {
      console.error('Failed to create AI habit:', error)
      // Fallback to mock response on error
      const mockResponse: AIResponse = {
        prompt,
        response: `Based on your goal: "${prompt}", I recommend breaking this down into smaller, manageable habits:`,
        suggestions: [
          'Start with 5 minutes daily',
          'Set a specific time each day',
          'Track your progress weekly'
        ]
      }
      setAiResponse(mockResponse)
      setSelectedTask(undefined)
      setCurrentPage('new')
    }
  }

  const handleToggleSelectedTask = (taskId: string) => {
    if (toggleTaskCallbackRef.current) {
      toggleTaskCallbackRef.current(taskId)
      // Update the selected task's completion status
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, completed: !prev.completed } : undefined)
      }
    }
  }

  const handleCreateTask = async (title: string, _description?: string) => {
    try {
      await createHabitMutation.mutateAsync({ description: title })
      // Also call the callback if it exists for local state update
      if (createTaskCallbackRef.current) {
        createTaskCallbackRef.current(title, _description)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleCreateTaskFromLeftPage = async (title: string, _description?: string) => {
    try {
      await createHabitMutation.mutateAsync({ description: title })
    } catch (error) {
      console.error('Failed to create task from left page:', error)
    }
  }


  const handleCloseCreateTask = () => {
    setShowCreateTaskPopup(false)
    createTaskCallbackRef.current = null
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
          <SwipeablePages currentPage={currentPage} onPageChange={handleNavigate}>
            <NewPageContent
              selectedTask={selectedTask}
              aiResponse={aiResponse}
              onToggleTask={handleToggleSelectedTask}
              onCreateTask={handleCreateTaskFromLeftPage}
              onAiSubmit={handleAiSubmit}
            />
            <HabitTrackerContent onOpenCreateTask={handleOpenCreateTask} onSelectTask={handleSelectTask} />
            <ButtonPageContent onButtonClick={handleButtonClick} onLogout={handleLogout} />
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
          onAiSubmit={handleAiSubmit}
        />
      )}

    </>
  )
}

export default App

import { useState, useRef } from 'react'
import { Box, Typography } from '@mui/material'
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
  const createTaskCallbackRef = useRef<((title: string, description?: string) => void) | null>(null)
  const toggleTaskCallbackRef = useRef<((taskId: string) => void) | null>(null)

  // const users = trpc.user.getUser.useQuery()
  const createUserMutation = trpc.user.createUser.useMutation({
    onSuccess: () => {
      users.refetch()
      setName('')
      setEmail('')
    }
  })
  const handleLogout = async () => {
    console.log('Logout functionality removed')
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

  const handleAiSubmit = (prompt: string) => {
    // Generate mock AI response for demonstration
    const mockResponse: AIResponse = {
      prompt,
      response: `Based on your goal: "${prompt}", I recommend breaking this down into smaller, manageable habits that you can build consistently over time. Here are some suggestions:`,
      suggestions: [
        'Start with 5 minutes daily',
        'Set a specific time each day',
        'Track your progress weekly',
        'Create a reward system',
        'Find an accountability partner'
      ]
    }

    setAiResponse(mockResponse)
    setSelectedTask(undefined) // Clear task selection when showing AI response
    setCurrentPage('new')
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

  const handleCreateTask = (title: string, description?: string) => {
    if (createTaskCallbackRef.current) {
      createTaskCallbackRef.current(title, description)
    }
  }

  const handleCreateTaskFromLeftPage = (title: string, description?: string) => {
    // This will be handled by the HabitTrackerContent component directly
    // For now, we'll just log it - this could be improved to use a shared task state
    console.log('Creating task from left page:', { title, description })
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

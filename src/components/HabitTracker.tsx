import { useState } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import BottomNav from './BottomNav.js'
import CreateTaskPopup from './CreateTaskPopup.js'

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

const TaskListContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0, // Important for flexbox scrolling
})

const ScrollableTaskList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  paddingRight: '8px',
  marginRight: '-8px',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(255,255,255,0.5)',
  },
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

const AddButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '20px',
})

const StyledAddButton = styled(IconButton)({
  backgroundColor: '#5B5F9E',
  color: '#FFFFFF',
  width: '56px',
  height: '56px',
  '&:hover': {
    backgroundColor: '#6B6FAE',
  },
})

interface HabitTrackerProps {
  onNavigate: (page: 'home' | 'button') => void
}

export default function HabitTracker({ onNavigate }: HabitTrackerProps) {
  const [showCreateTaskPopup, setShowCreateTaskPopup] = useState(false)
  const [tasks, setTasks] = useState([
    'Make the bed',
    'Exercise for 30 minutes',
    'Read 10 pages',
    'Drink 8 glasses of water',
    'Meditate for 5 minutes',
    'Write in journal'
  ])

  const handleCreateTask = (title: string) => {
    setTasks([...tasks, title])
  }

  const handleOpenCreateTask = () => {
    setShowCreateTaskPopup(true)
  }

  const handleCloseCreateTask = () => {
    setShowCreateTaskPopup(false)
  }

  return (
    <>
      <AppContainer>
        <MobileFrame>
          <GradientContainer>
            <StreakContainer>
              <Box>
                <StreakText>67</StreakText>
                <StreakSubText>day streak!</StreakSubText>
              </Box>
              <FireEmoji>🔥</FireEmoji>
            </StreakContainer>

            <TaskListContainer>
              <ScrollableTaskList>
                {tasks.map((task, index) => (
                  <HabitCard key={index}>
                    <HabitText>{task}</HabitText>
                  </HabitCard>
                ))}

                {/* Show empty cards only if we have less than 3 tasks */}
                {tasks.length < 3 && Array.from({ length: 3 - tasks.length }, (_, index) => (
                  <EmptyHabitCard key={`empty-${index}`} />
                ))}
              </ScrollableTaskList>

              <AddButtonContainer>
                <StyledAddButton onClick={handleOpenCreateTask}>
                  <AddIcon />
                </StyledAddButton>
              </AddButtonContainer>
            </TaskListContainer>
          </GradientContainer>
          <BottomNav currentPage="home" onNavigate={onNavigate} />
        </MobileFrame>
      </AppContainer>

      {showCreateTaskPopup && (
        <CreateTaskPopup
          onClose={handleCloseCreateTask}
          onCreateTask={handleCreateTask}
        />
      )}
    </>
  )
}
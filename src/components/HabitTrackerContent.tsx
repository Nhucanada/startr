import { useState } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'

const GradientContainer = styled(Box)({
  height: '100%',
  padding: '32px 32px 100px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
})

const StreakContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '5px',
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

const StreakCounter = styled(Box)({
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: '16px',
  padding: '8px 12px',
  marginRight: '12px',
  flexShrink: 0,
})

const TaskStreakText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '600',
})

const TaskRightContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

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

const TaskListContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
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

interface Task {
  id: string
  title: string
  completed: boolean
  streak: number
}

interface HabitTrackerContentProps {
  onOpenCreateTask: (callback: (title: string) => void) => void
}

export default function HabitTrackerContent({
  onOpenCreateTask,
}: HabitTrackerContentProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Make the bed', completed: false, streak: 5 },
    { id: '2', title: 'Exercise for 30 minutes', completed: true, streak: 12 },
    { id: '3', title: 'Read 10 pages', completed: false, streak: 3 },
    { id: '4', title: 'Drink 8 glasses of water', completed: false, streak: 1 },
    { id: '5', title: 'Meditate for 5 minutes', completed: true, streak: 8 },
    { id: '6', title: 'Write in journal', completed: false, streak: 0 }
  ])

  const handleCreateTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      streak: 0,
    }
    setTasks([...tasks, newTask])
  }

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleOpenCreateTask = () => {
    onOpenCreateTask(handleCreateTask)
  }

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <GradientContainer>
      <StreakContainer>
        <Box>
          <StreakText>{completedCount}</StreakText>
          <StreakSubText>tasks completed!</StreakSubText>
        </Box>
        <FireEmoji>🔥</FireEmoji>
      </StreakContainer>

      <TaskListContainer>
        <ScrollableTaskList>
          {tasks.map((task) => (
            <HabitCard key={task.id}>
              <HabitText>{task.title}</HabitText>
              <TaskRightContainer>
                <StreakCounter>
                  <TaskStreakText>{task.streak} 🔥</TaskStreakText>
                </StreakCounter>
                <CheckboxContainer
                  checked={task.completed}
                  onClick={() => handleToggleTask(task.id)}
                >
                  {task.completed && (
                    <CheckIcon sx={{ color: '#FFFFFF', fontSize: '28px' }} />
                  )}
                </CheckboxContainer>
              </TaskRightContainer>
            </HabitCard>
          ))}

          {tasks.length < 3 &&
            Array.from({ length: 3 - tasks.length }, (_, index) => (
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
  )
}

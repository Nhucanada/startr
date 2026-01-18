import { Box, Typography, IconButton, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import { trpc } from '../utils/trpc.js'

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
  justifyContent: 'center',
  marginBottom: '24px',
})

const CircularProgressContainer = styled(Box)({
  position: 'relative',
  width: '180px',
  height: '180px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const CircularProgressText = styled(Box)({
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
})

const ProgressNumber = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '48px',
  fontWeight: '600',
  lineHeight: '1',
})

const ProgressLabel = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '400',
  opacity: 0.9,
  marginTop: '4px',
})


const HabitCard = styled(Box)({
  backgroundColor: '#5B5F9E',
  borderRadius: '20px',
  padding: '16px 12px',
  marginBottom: '16px',
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const CheckboxContainer = styled(Box)<{ checked: boolean }>(({ checked }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
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
  borderRadius: '8px',
  padding: '2px 6px',
  marginRight: '6px',
  flexShrink: 0,
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '40px',
})

const TaskStreakText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '11px',
  fontWeight: '600',
  lineHeight: '1',
})

const TaskRightContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexShrink: 0,
})

const EmptyHabitCard = styled(Box)({
  backgroundColor: '#4A4E7A',
  borderRadius: '20px',
  padding: '16px 12px',
  marginBottom: '16px',
  minHeight: '60px',
  opacity: 0.6,
})

const HabitText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '1.3',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  minWidth: 0,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
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
  description?: string
  completed: boolean
  streak: number
}

interface HabitTrackerContentProps {
  onOpenCreateTask: (callback: (title: string, description?: string) => void) => void
  onSelectTask: (task: Task, toggleCallback: (taskId: string) => void) => void
}

export default function HabitTrackerContent({
  onOpenCreateTask,
  onSelectTask,
}: HabitTrackerContentProps) {
  const utils = trpc.useUtils()

  // Fetch habits from backend
  const { data: habits, isLoading, error } = trpc.habits.getUserHabits.useQuery()

  // Mutation for updating habit status
  const updateHabitMutation = trpc.habits.updateHabit.useMutation({
    onSuccess: () => {
      utils.habits.getUserHabits.invalidate()
    },
  })

  // Transform backend habits to frontend Task format
  const tasks: Task[] = (habits ?? []).map((habit) => ({
    id: habit.id,
    title: habit.description,
    description: undefined,
    completed: habit.status === 'completed',
    streak: 0, // Backend doesn't track streaks yet
  }))

  const handleCreateTask = (title: string, description?: string) => {
    // This is now handled by App.tsx via the popup
    // The local state is automatically updated via query invalidation
    console.log('Task created via backend:', { title, description })
  }

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = task.completed ? 'active' : 'completed'
    try {
      await updateHabitMutation.mutateAsync({
        uuid: taskId,
        data: { status: newStatus as 'active' | 'completed' | 'archived' },
      })
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  const handleOpenCreateTask = () => {
    onOpenCreateTask(handleCreateTask)
  }

  const handleTaskClick = (task: Task) => {
    onSelectTask(task, handleToggleTask)
  }

  const completedCount = tasks.filter((task) => task.completed).length

  // Loading state
  if (isLoading) {
    return (
      <GradientContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress sx={{ color: '#7FD4A3' }} />
        </Box>
      </GradientContainer>
    )
  }

  // Error state
  if (error) {
    return (
      <GradientContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ color: '#FFFFFF', textAlign: 'center' }}>
            Failed to load habits
          </Typography>
          <Typography sx={{ color: '#FFFFFF', opacity: 0.7, fontSize: '14px', textAlign: 'center' }}>
            Please try again later
          </Typography>
        </Box>
      </GradientContainer>
    )
  }

  return (
    <GradientContainer>
      <StreakContainer>
        <CircularProgressContainer>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7FD4A3" />
                <stop offset="100%" stopColor="#5BC4A8" />
              </linearGradient>
            </defs>
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="#5B5F9E"
              strokeWidth="10"
            />
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - (tasks.length > 0 ? completedCount / tasks.length : 0))}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          <CircularProgressText>
            <ProgressNumber>{completedCount}</ProgressNumber>
            <ProgressLabel>tasks done!</ProgressLabel>
          </CircularProgressText>
        </CircularProgressContainer>
      </StreakContainer>

      <TaskListContainer>
        <ScrollableTaskList>
          {tasks.map((task) => (
            <HabitCard key={task.id}>
              <HabitText onClick={() => handleTaskClick(task)}>{task.title}</HabitText>
              <TaskRightContainer>
                <StreakCounter>
                  <TaskStreakText>{task.streak} 🔥</TaskStreakText>
                </StreakCounter>
                <CheckboxContainer
                  checked={task.completed}
                  onClick={() => handleToggleTask(task.id)}
                >
                  {task.completed && (
                    <CheckIcon sx={{ color: '#FFFFFF', fontSize: '20px' }} />
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

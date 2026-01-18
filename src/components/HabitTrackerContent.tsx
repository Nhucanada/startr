import { useEffect, useRef, useState } from 'react'
import { Box, Typography, IconButton, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import { trpc } from '../utils/trpc.js'
import { authService } from '../services/auth.js'

const GradientContainer = styled(Box)({
  height: '100%',
  padding: '80px 32px 32px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
})

const StreakContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '32px',
  flexShrink: 0,
  padding: '24px',
  backgroundColor: '#3D4175',
  borderRadius: '20px',
})

const StreakTextContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
})

const StreakNumber = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '64px',
  fontWeight: '700',
  lineHeight: '1',
})

const StreakLabel = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: '400',
  opacity: 0.9,
  marginTop: '4px',
})


const HabitCard = styled(Box)({
  backgroundColor: '#5B5F9E',
  borderRadius: '20px',
  padding: '16px 12px',
  marginBottom: '20px',
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
})

const HabitCardProgress = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  backgroundColor: '#7FD4A3',
  transition: 'width 0.1s linear',
  zIndex: 0,
})

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
  position: 'relative',
  zIndex: 1,
})

const EmphasisOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.55)',
  zIndex: 1,
  pointerEvents: 'none',
})

const UrgencyText = styled(Typography)({
  color: '#FF6B6B',
  fontSize: '12px',
  fontWeight: '600',
  marginTop: '-8px',
  marginBottom: '12px',
})

const EmptyHabitCard = styled(Box)({
  backgroundColor: '#4A4E7A',
  borderRadius: '20px',
  padding: '16px 12px',
  marginBottom: '20px',
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
  position: 'relative',
  zIndex: 1,
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
  paddingTop: '4px',
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
  marginTop: '24px',
  flexShrink: 0,
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
  onOpenCreateTask: () => void
  onPanic: () => void
  onEmphasisChange?: (active: boolean) => void
}

export default function HabitTrackerContent({
  onOpenCreateTask,
  onPanic,
  onEmphasisChange,
}: HabitTrackerContentProps) {
  const utils = trpc.useUtils()
  const isAuthenticated = authService.isAuthenticated()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  // Streak tracking with localStorage persistence
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('habit_streak')
    return saved ? parseInt(saved, 10) : 0
  })
  const [streakIncrementedToday, setStreakIncrementedToday] = useState<boolean>(() => {
    const lastIncrement = localStorage.getItem('streak_last_increment')
    if (!lastIncrement) return false
    const today = new Date().toDateString()
    return lastIncrement === today
  })
  const [holdTaskId, setHoldTaskId] = useState<string | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [holdState, setHoldState] = useState<'idle' | 'holding' | 'depleting' | 'panic'>('idle')
  const holdIntervalRef = useRef<number | null>(null)
  const holdStartRef = useRef<number | null>(null)
  const holdCompletedRef = useRef(false)
  const panicTriggeredRef = useRef(false)

  // Fetch habits from backend - only when authenticated
  const { data: habits, isLoading, error } = trpc.habits.getUserHabits.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  // Debug logging for habit loading errors
  if (error) {
    console.error('[HabitTrackerContent] Failed to load habits:', error.message, error)
  }

  const completeHabitMutation = trpc.habits.completeHabit.useMutation({
    onSuccess: () => {
      utils.habits.getUserHabits.invalidate()
    },
  })

  const uncompleteHabitMutation = trpc.habits.uncompleteHabit.useMutation({
    onSuccess: () => {
      utils.habits.getUserHabits.invalidate()
    },
  })

  // Transform backend habits to frontend Task format
  const tasks: Task[] = (habits ?? []).map((habit) => ({
    id: habit.id,
    title: habit.name,
    description: habit.desc ?? undefined,
    completed: completedIds.has(habit.id),
    streak: 0, // Backend doesn't track streaks yet
  }))

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const isCurrentlyCompleted = completedIds.has(taskId)

    // Optimistic update
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (isCurrentlyCompleted) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })

    try {
      if (isCurrentlyCompleted) {
        await uncompleteHabitMutation.mutateAsync({ habitId: taskId })
      } else {
        await completeHabitMutation.mutateAsync({ habitId: taskId })
      }
    } catch (err) {
      // Rollback on failure
      setCompletedIds((prev) => {
        const next = new Set(prev)
        if (isCurrentlyCompleted) {
          next.add(taskId)
        } else {
          next.delete(taskId)
        }
        return next
      })
      console.error('Failed to mark habit as completed:', err)
    }
  }

  const resetHold = () => {
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    holdStartRef.current = null
    setHoldProgress(0)
    setHoldTaskId(null)
    setHoldState('idle')
    // Remove global listener if still attached
    document.removeEventListener('mouseup', endHold)
  }

  const startHold = (task: Task) => {
    if (task.completed) return
    panicTriggeredRef.current = false
    holdCompletedRef.current = false
    setHoldState('holding')
    setHoldTaskId(task.id)
    setHoldProgress(0)
    holdStartRef.current = Date.now()

    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current)
    }

    holdIntervalRef.current = window.setInterval(() => {
      if (!holdStartRef.current) return
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min(100, (elapsed / 5000) * 100)
      setHoldProgress(progress)
      if (progress >= 100) {
        holdCompletedRef.current = true
        handleToggleTask(task.id)
        resetHold()
      }
    }, 50)
  }

  const endHold = () => {
    if (holdState !== 'holding' || !holdTaskId) {
      resetHold()
      return
    }

    if (holdProgress >= 100) {
      resetHold()
      return
    }

    setHoldState('depleting')
    const startProgress = holdProgress
    const startTime = Date.now()
    const duration = 2500

    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current)
    }

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.max(0, startProgress * (1 - elapsed / duration))
      setHoldProgress(progress)
      if (progress <= 0) {
        if (holdIntervalRef.current) {
          window.clearInterval(holdIntervalRef.current)
          holdIntervalRef.current = null
        }
        if (!panicTriggeredRef.current) {
          panicTriggeredRef.current = true
          setHoldState('panic')
          setHoldProgress(0)
          setHoldTaskId(null)
          onPanic()
        }
      }
    }, 50)
  }

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        window.clearInterval(holdIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!onEmphasisChange) return
    const active = holdState === 'depleting' || holdState === 'panic'
    onEmphasisChange(active)
  }, [holdState, onEmphasisChange])

  // Check if all tasks are completed and increment streak
  useEffect(() => {
    // Only check if we have tasks and haven't already incremented today
    if (tasks.length === 0 || streakIncrementedToday) return

    const allCompleted = tasks.every((task) => task.completed)

    if (allCompleted) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setStreakIncrementedToday(true)

      // Persist to localStorage
      localStorage.setItem('habit_streak', newStreak.toString())
      localStorage.setItem('streak_last_increment', new Date().toDateString())
    }
  }, [tasks, streakIncrementedToday, streak])

  const handleOpenCreateTask = () => {
    onOpenCreateTask()
  }

  const handleCardClick = () => {
    if (holdCompletedRef.current) {
      holdCompletedRef.current = false
      return
    }
  }

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
      {holdState === 'depleting' && <EmphasisOverlay />}
      <StreakContainer>
        <StreakTextContainer>
          <StreakNumber>{5 + streak}</StreakNumber>
          <StreakLabel>day streak!</StreakLabel>
        </StreakTextContainer>
        <Box sx={{ width: '96px', height: '96px' }}>
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M78 56C78 72.79 64.788 86 47.998 86C31.208 86 18 72.79 18 56C18 39.21 44.958 25.2 41.918 10C48 10 78 31.682 78 56Z" fill="#FF9600"/>
            <path d="M34.5311 67.6405C34.5338 58.4669 48.0007 53.2175 48.0007 45C48.0007 45 61.4649 55.321 61.4649 67.6405C61.4649 74.4413 55.4398 79.96 47.998 79.96C40.5562 79.96 34.5284 74.444 34.5311 67.6405Z" fill="#FFC107"/>
          </svg>
        </Box>
      </StreakContainer>

      <TaskListContainer sx={{ position: 'relative', zIndex: 2 }}>
        <ScrollableTaskList>
          {tasks.map((task) => (
            <Box key={task.id} sx={{ position: 'relative' }}>
              <HabitCard
              onClick={handleCardClick}
                onMouseDown={() => startHold(task)}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={() => startHold(task)}
                onTouchEnd={endHold}
                onTouchCancel={endHold}
                sx={{
                  backgroundColor: task.completed ? '#7FD4A3' : '#5B5F9E',
                  zIndex:
                    (holdState === 'depleting' || holdState === 'panic') && holdTaskId === task.id
                      ? 3
                      : 'auto',
                opacity:
                  (holdState === 'depleting' || holdState === 'panic') &&
                  holdTaskId &&
                  holdTaskId !== task.id
                    ? 0.4
                    : 1,
                }}
              >
                <HabitCardProgress
                  sx={{
                    width: task.completed
                      ? '100%'
                      : holdTaskId === task.id
                        ? `${holdProgress}%`
                        : '0%',
                  }}
                />
                <HabitText>{task.title}</HabitText>
                <TaskRightContainer>
                  {task.streak > 0 && (
                    <StreakCounter>
                      <TaskStreakText>{task.streak} 🔥</TaskStreakText>
                    </StreakCounter>
                  )}
                </TaskRightContainer>
              </HabitCard>
              {holdState === 'depleting' && holdTaskId === task.id && (
                <UrgencyText>Hold to complete this task or face shame.</UrgencyText>
              )}
            </Box>
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
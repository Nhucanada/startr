import React, { useState, useEffect } from 'react'
import { Box, Typography, IconButton, TextField, Button, Tabs, Tab, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { trpc } from '../utils/trpc.js'

const Container = styled(Box)({
  height: '100%',
  padding: '60px 32px 120px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

const TaskDetailCard = styled(Box)({
  backgroundColor: '#5B5F9E',
  borderRadius: '20px',
  padding: '24px',
  marginBottom: '24px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

const TaskTitle = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.2',
})

const TaskDescription = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '400',
  opacity: 0.9,
  lineHeight: '1.5',
})

const TaskStats = styled(Box)({
  display: 'flex',
  gap: '20px',
  marginTop: 'auto',
})

const StatItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

const StatText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '500',
})

const CompletionButton = styled(IconButton)<{ completed: boolean }>(({ completed }) => ({
  backgroundColor: completed ? '#7FD4A3' : 'rgba(255,255,255,0.2)',
  color: '#FFFFFF',
  width: '60px',
  height: '60px',
  alignSelf: 'center',
  marginTop: '20px',
  '&:hover': {
    backgroundColor: completed ? '#6FC993' : 'rgba(255,255,255,0.3)',
  },
}))


const AIResponseCard = styled(Box)({
  backgroundColor: '#5B5F9E',
  borderRadius: '20px',
  padding: '24px',
  marginBottom: '24px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

const AIHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
})

const AITitle = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '20px',
  fontWeight: '600',
})

const AIResponseText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '1.6',
  marginBottom: '20px',
})

const TaskCreationCard = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  height: '60vh',
  maxHeight: '500px',
  backgroundColor: '#2A2E5A',
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
})

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    color: '#FFFFFF',
    backgroundColor: '#1A1B4B',
    borderRadius: '8px',
  },
  '& .MuiInputLabel-root': {
    color: '#FFFFFF',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#5B5F9E',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#6B6FAE',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#5B5F9E',
  },
})

const SubmitButton = styled(Button)({
  backgroundColor: '#5B5F9E',
  color: '#FFFFFF',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '16px',
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: '#6B6FAE',
  },
  '&:disabled': {
    backgroundColor: '#3A3E6A',
    color: '#8A8A8A',
  },
})

const StyledTabs = styled(Tabs)({
  marginBottom: '20px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#5B5F9E',
  },
})

const StyledTab = styled(Tab)({
  color: '#FFFFFF',
  textTransform: 'none',
  fontSize: '16px',
  '&.Mui-selected': {
    color: '#5B5F9E',
  },
})

const TabContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
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

interface NewPageContentProps {
  selectedTask?: Task
  aiResponse?: AIResponse
  onToggleTask?: (taskId: string) => void
  onCreateTask?: (title: string, description?: string) => void
  onAiSubmit?: (prompt: string) => void
}

type ViewMode = 'taskDetail' | 'aiResponse' | 'createTask'

export default function NewPageContent({ selectedTask, aiResponse, onToggleTask, onCreateTask, onAiSubmit }: NewPageContentProps) {
  const [currentTab, setCurrentTab] = useState(0)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addingSuggestion, setAddingSuggestion] = useState<number | null>(null)

  const utils = trpc.useUtils()

  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      utils.habits.getUserHabits.invalidate()
    },
  })

  // Reset form fields when neither selectedTask nor aiResponse are present
  useEffect(() => {
    if (!selectedTask && !aiResponse) {
      setTaskTitle('')
      setTaskDescription('')
      setAiPrompt('')
      setCurrentTab(0)
    }
  }, [selectedTask, aiResponse])

  // Determine view mode based on props
  const currentMode: ViewMode = selectedTask ? 'taskDetail' : aiResponse ? 'aiResponse' : 'createTask'

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    event.stopPropagation()
    setCurrentTab(newValue)
  }

  const handleCreateTaskSubmit = async () => {
    if (taskTitle.trim() && onCreateTask) {
      setIsSubmitting(true)
      try {
        await createHabitMutation.mutateAsync({ description: taskTitle.trim() })
        onCreateTask(taskTitle.trim(), taskDescription.trim() || undefined)
        setTaskTitle('')
        setTaskDescription('')
      } catch (error) {
        console.error('Failed to create task:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleAiSubmit = () => {
    if (aiPrompt.trim() && onAiSubmit) {
      setIsSubmitting(true)
      onAiSubmit(aiPrompt.trim())
      setAiPrompt('')
      // isSubmitting will be reset when component rerenders with aiResponse
    }
  }

  const handleAddSuggestion = async (suggestion: string, index: number) => {
    setAddingSuggestion(index)
    try {
      await createHabitMutation.mutateAsync({ description: suggestion })
      onCreateTask?.(suggestion)
    } catch (error) {
      console.error('Failed to add suggestion as habit:', error)
    } finally {
      setAddingSuggestion(null)
    }
  }

  const renderTaskDetail = () => (
    <Container>
      <TaskDetailCard>
        <TaskTitle>{selectedTask!.title}</TaskTitle>

        {selectedTask!.description && (
          <TaskDescription>{selectedTask!.description}</TaskDescription>
        )}

        <TaskStats>
          <StatItem>
            <LocalFireDepartmentIcon sx={{ color: '#FF6B35', fontSize: '20px' }} />
            <StatText>{selectedTask!.streak} day streak</StatText>
          </StatItem>
          <StatItem>
            <StatText>Status: {selectedTask!.completed ? 'Completed' : 'Pending'}</StatText>
          </StatItem>
        </TaskStats>
      </TaskDetailCard>

      {onToggleTask && (
        <CompletionButton
          completed={selectedTask!.completed}
          onClick={() => onToggleTask(selectedTask!.id)}
        >
          <CheckIcon sx={{ fontSize: '30px' }} />
        </CompletionButton>
      )}
    </Container>
  )

  const renderAIResponse = () => (
    <Container>
      <AIResponseCard>
        <AIHeader>
          <SmartToyIcon sx={{ color: '#7FD4A3', fontSize: '24px' }} />
          <AITitle>AI Suggestions</AITitle>
        </AIHeader>

        <Typography sx={{ color: '#FFFFFF', fontSize: '14px', opacity: 0.8, mb: 2 }}>
          Your prompt: "{aiResponse!.prompt}"
        </Typography>

        <AIResponseText>{aiResponse!.response}</AIResponseText>

        <Box>
          <Typography sx={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '500', mb: 2 }}>
            Suggested tasks:
          </Typography>
          {aiResponse!.suggestions.map((suggestion, index) => (
            <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: '#FFFFFF', fontSize: '14px', flex: 1 }}>
                • {suggestion}
              </Typography>
              <IconButton
                size="small"
                sx={{ color: '#7FD4A3' }}
                onClick={() => handleAddSuggestion(suggestion, index)}
                disabled={addingSuggestion !== null}
              >
                {addingSuggestion === index ? (
                  <CircularProgress size={16} sx={{ color: '#7FD4A3' }} />
                ) : (
                  <AddIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          ))}
        </Box>
      </AIResponseCard>
    </Container>
  )

  const renderCreateTask = () => (
    <Container>
      <TaskCreationCard>
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, mt: 1 }}>
          Create New Task
        </Typography>

        <StyledTabs value={currentTab} onChange={handleTabChange}>
          <StyledTab
            icon={<EditIcon />}
            label="Manual"
            iconPosition="start"
          />
          <StyledTab
            icon={<SmartToyIcon />}
            label="AI Assistant"
            iconPosition="start"
          />
        </StyledTabs>

        <TabContent>
          {currentTab === 0 ? (
            // Manual Tab
            <>
              <StyledTextField
                fullWidth
                label="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g., Exercise for 30 minutes"
                variant="outlined"
              />

              <StyledTextField
                fullWidth
                multiline
                rows={2}
                label="Description (Optional)"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add more details about this task..."
                variant="outlined"
              />

              <SubmitButton
                onClick={handleCreateTaskSubmit}
                disabled={!taskTitle.trim() || isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Create Task'}
              </SubmitButton>
            </>
          ) : (
            // AI Tab
            <>
              <StyledTextField
                fullWidth
                multiline
                rows={3}
                label="Describe your goal"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., I want to build a morning routine that helps me feel energized"
                variant="outlined"
              />

              <SubmitButton
                onClick={handleAiSubmit}
                disabled={!aiPrompt.trim() || isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Get AI Suggestions'}
              </SubmitButton>
            </>
          )}
        </TabContent>
      </TaskCreationCard>
    </Container>
  )

  switch (currentMode) {
    case 'taskDetail':
      return renderTaskDetail()
    case 'aiResponse':
      return renderAIResponse()
    case 'createTask':
    default:
      return renderCreateTask()
  }
}

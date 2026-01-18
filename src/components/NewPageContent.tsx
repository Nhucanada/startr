import { useState, useEffect } from 'react'
import { Box, Typography, IconButton, TextField, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import AddIcon from '@mui/icons-material/Add'

const Container = styled(Box)({
  height: '100%',
  padding: '40px 32px 100px',
  display: 'flex',
  flexDirection: 'column',
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

const AIResponse = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '1.6',
  marginBottom: '20px',
})

const TaskCreationCard = styled(Box)({
  backgroundColor: '#5B5F9E',
  borderRadius: '20px',
  padding: '24px',
  marginBottom: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
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
}

type ViewMode = 'taskDetail' | 'aiResponse' | 'createTask'

export default function NewPageContent({ selectedTask, aiResponse, onToggleTask, onCreateTask }: NewPageContentProps) {
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')

  // Reset form fields when neither selectedTask nor aiResponse are present
  useEffect(() => {
    if (!selectedTask && !aiResponse) {
      setTaskTitle('')
      setTaskDescription('')
    }
  }, [selectedTask, aiResponse])

  // Determine view mode based on props
  const currentMode: ViewMode = selectedTask ? 'taskDetail' : aiResponse ? 'aiResponse' : 'createTask'

  const handleCreateTaskSubmit = () => {
    if (taskTitle.trim() && onCreateTask) {
      onCreateTask(taskTitle.trim(), taskDescription.trim() || undefined)
      setTaskTitle('')
      setTaskDescription('')
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

        <AIResponse>{aiResponse!.response}</AIResponse>

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
                onClick={() => onCreateTask?.(suggestion)}
              >
                <AddIcon fontSize="small" />
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
        <Typography sx={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '600', mb: 2 }}>
          Create New Task
        </Typography>

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
          rows={3}
          label="Description (Optional)"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Add more details about this task..."
          variant="outlined"
        />

        <SubmitButton
          onClick={handleCreateTaskSubmit}
          disabled={!taskTitle.trim()}
        >
          Create Task
        </SubmitButton>
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

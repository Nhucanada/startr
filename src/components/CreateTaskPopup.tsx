import { useState } from 'react'
import { Box, Typography, IconButton, TextField, Button, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import EditIcon from '@mui/icons-material/Edit'

const PopupOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
})

const PopupContainer = styled(Box)({
  width: '90vw',
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

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
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

const PlaceholderText = styled(Typography)({
  color: '#8A8A8A',
  fontStyle: 'italic',
  textAlign: 'center',
  marginTop: '20px',
})

interface CreateTaskPopupProps {
  onClose: () => void
  onCreateTask: (title: string) => void
}

export default function CreateTaskPopup({ onClose, onCreateTask }: CreateTaskPopupProps) {
  const [currentTab, setCurrentTab] = useState(0)
  const [manualTitle, setManualTitle] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const handleManualSubmit = () => {
    if (manualTitle.trim()) {
      onCreateTask(manualTitle.trim())
      onClose()
    }
  }

  const handleAiSubmit = () => {
    if (aiPrompt.trim()) {
      // Placeholder for AI functionality
      console.log('AI prompt:', aiPrompt)
      // For now, create a task with AI prefix
      onCreateTask(`AI: ${aiPrompt.trim()}`)
      onClose()
    }
  }

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>

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
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g., Exercise for 30 minutes"
                variant="outlined"
              />

              <SubmitButton
                onClick={handleManualSubmit}
                disabled={!manualTitle.trim()}
              >
                Create Task
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

              <PlaceholderText>
                🤖 AI integration coming soon!
                <br />
                For now, this will create a task with your description.
              </PlaceholderText>

              <SubmitButton
                onClick={handleAiSubmit}
                disabled={!aiPrompt.trim()}
              >
                Send to AI
              </SubmitButton>
            </>
          )}
        </TabContent>
      </PopupContainer>
    </PopupOverlay>
  )
}
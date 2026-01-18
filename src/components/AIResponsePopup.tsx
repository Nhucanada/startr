import { Box, Typography, IconButton, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import SmartToyIcon from '@mui/icons-material/SmartToy'

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
  maxWidth: '420px',
  maxHeight: '70vh',
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

const SectionTitle = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '14px',
  opacity: 0.8,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginTop: '12px',
})

const BodyText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  lineHeight: '1.6',
  marginTop: '8px',
})

const SuggestionsList = styled(Box)({
  marginTop: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

const SuggestionItem = styled(Box)({
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '10px 12px',
})

const CloseAction = styled(Button)({
  marginTop: '16px',
  alignSelf: 'flex-end',
  backgroundColor: '#5B5F9E',
  color: '#FFFFFF',
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#6B6FAE',
  },
})

export interface AIResponsePayload {
  prompt: string
  response: string
  suggestions: string[]
}

interface AIResponsePopupProps {
  response: AIResponsePayload
  onClose: () => void
}

export default function AIResponsePopup({ response, onClose }: AIResponsePopupProps) {
  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon sx={{ color: '#7FD4A3' }} />
          <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
            AI Response
          </Typography>
        </Box>

        <SectionTitle>Goal</SectionTitle>
        <BodyText>{response.prompt}</BodyText>

        <SectionTitle>Response</SectionTitle>
        <BodyText>{response.response}</BodyText>

        {response.suggestions.length > 0 && (
          <>
            <SectionTitle>Suggested Steps</SectionTitle>
            <SuggestionsList>
              {response.suggestions.map((suggestion, index) => (
                <SuggestionItem key={`${suggestion}-${index}`}>
                  <BodyText sx={{ marginTop: 0 }}>{suggestion}</BodyText>
                </SuggestionItem>
              ))}
            </SuggestionsList>
          </>
        )}

        <CloseAction onClick={onClose}>Close</CloseAction>
      </PopupContainer>
    </PopupOverlay>
  )
}

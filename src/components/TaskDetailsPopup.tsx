import { Box, Typography, IconButton, Button, Portal } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

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

const Description = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  lineHeight: '1.6',
  marginTop: '12px',
  opacity: 0.9,
})

const ActionRow = styled(Box)({
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'flex-end',
})

const DeleteButton = styled(Button)({
  backgroundColor: 'rgba(255, 107, 107, 0.2)',
  color: '#FF6B6B',
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
  },
})

interface TaskDetailsPopupProps {
  title: string
  description?: string
  onClose: () => void
  onDelete: () => void
}

export default function TaskDetailsPopup({
  title,
  description,
  onClose,
  onDelete,
}: TaskDetailsPopupProps) {
  return (
    <Portal>
      <PopupOverlay onClick={onClose}>
        <PopupContainer onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>

          <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
            {title}
          </Typography>
          <Description>{description || 'No description provided.'}</Description>

          <ActionRow>
            <DeleteButton startIcon={<DeleteOutlineIcon />} onClick={onDelete}>
              Delete
            </DeleteButton>
          </ActionRow>
        </PopupContainer>
      </PopupOverlay>
    </Portal>
  )
}

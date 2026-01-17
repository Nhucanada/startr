import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'

const ButtonContainer = styled(Box)<{ pressed: boolean }>(({ pressed }) => ({
  position: 'relative',
  width: '200px',
  height: '200px',
  cursor: 'pointer',
  transform: pressed ? 'translateY(8px)' : 'translateY(0)',
  transition: 'transform 0.1s ease',
}))

const ButtonShadow = styled(Box)<{ pressed: boolean }>(({ pressed }) => ({
  position: 'absolute',
  width: '200px',
  height: '200px',
  backgroundColor: '#4A4A4A',
  borderRadius: '50%',
  top: pressed ? '8px' : '16px',
  left: '0',
  transition: 'top 0.1s ease',
}))

const ButtonTop = styled(Box)<{ pressed: boolean }>(({ pressed }) => ({
  position: 'absolute',
  width: '200px',
  height: '200px',
  background: pressed
    ? 'linear-gradient(135deg, #C44536 0%, #E85A4F 50%, #C44536 100%)'
    : 'linear-gradient(135deg, #E85A4F 0%, #FF6B5B 50%, #E85A4F 100%)',
  borderRadius: '50%',
  top: '0',
  left: '0',
  transition: 'background 0.1s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: pressed
    ? 'inset 0 4px 8px rgba(0,0,0,0.3)'
    : 'inset 0 -4px 8px rgba(0,0,0,0.1), inset 0 4px 8px rgba(255,255,255,0.2)',
}))

interface Button3DProps {
  onClick?: () => void
}

export default function Button3D({ onClick }: Button3DProps) {
  const [pressed, setPressed] = useState(false)

  const handleMouseDown = () => {
    setPressed(true)
  }

  const handleMouseUp = () => {
    setPressed(false)
    onClick?.()
  }

  const handleMouseLeave = () => {
    setPressed(false)
  }

  return (
    <ButtonContainer
      pressed={pressed}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <ButtonShadow pressed={pressed} />
      <ButtonTop pressed={pressed} />
    </ButtonContainer>
  )
}
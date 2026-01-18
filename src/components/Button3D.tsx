import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import ButtonSVG from './button.svg'
import ButtonPressedSVG from './button_pressed.svg'

const ButtonContainer = styled(Box)({
  cursor: 'pointer',
  userSelect: 'none',
})

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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={pressed ? ButtonPressedSVG : ButtonSVG}
        alt="Button"
        draggable={false}
      />
    </ButtonContainer>
  )
}

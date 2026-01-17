import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import Button3D from './Button3D.js'

const Container = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingBottom: '80px',
})

interface ButtonPageContentProps {
  onButtonClick: () => void
}

export default function ButtonPageContent({ onButtonClick }: ButtonPageContentProps) {
  return (
    <Container>
      <Button3D onClick={onButtonClick} />
    </Container>
  )
}

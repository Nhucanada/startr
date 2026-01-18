import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Button3D from './Button3D.js'

const Container = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '112px 32px 80px',
})

const Title = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '32px',
  fontWeight: '700',
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '8px',
})

const Description = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '400',
  textAlign: 'center',
  opacity: 0.8,
  lineHeight: '1.5',
  maxWidth: '280px',
})

interface ButtonPageContentProps {
  onButtonClick: () => void
}

export default function ButtonPageContent({ onButtonClick }: ButtonPageContentProps) {
  return (
    <Container>
      <Button3D onClick={onButtonClick} />
      <Title>Panic Button</Title>
      <Description>
        Struggling to stick to your habits? When motivation is low and you need that extra push, click here for instant motivation and accountability.
      </Description>
    </Container>
  )
}

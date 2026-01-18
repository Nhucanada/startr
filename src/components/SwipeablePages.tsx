import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ReactNode } from 'react'

export type PageType = 'home' | 'button'

const PAGE_ORDER: PageType[] = ['home', 'button']

const PagesContainer = styled(Box)({
  display: 'flex',
  height: '100%',
  width: '200%',
  transition: 'none',
})

const PageWrapper = styled(Box)({
  width: '50%',
  height: '100%',
  flexShrink: 0,
})

interface SwipeablePagesProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  children: ReactNode[]
}

export default function SwipeablePages({
  currentPage,
  children,
}: SwipeablePagesProps) {
  const currentIndex = PAGE_ORDER.indexOf(currentPage)
  const translateX = -currentIndex * 50

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        touchAction: 'pan-y',
      }}
    >
      <PagesContainer
        sx={{
          transform: `translateX(${translateX}%)`,
        }}
      >
        {children.map((child, index) => (
          <PageWrapper key={index}>{child}</PageWrapper>
        ))}
      </PagesContainer>
    </Box>
  )
}

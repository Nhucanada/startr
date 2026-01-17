import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useSwipeable } from 'react-swipeable'
import { ReactNode } from 'react'

export type PageType = 'new' | 'home' | 'button'

const PAGE_ORDER: PageType[] = ['new', 'home', 'button']

const PagesContainer = styled(Box)({
  display: 'flex',
  height: '100%',
  width: '300%',
  transition: 'transform 0.3s ease-out',
})

const PageWrapper = styled(Box)({
  width: '33.333%',
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
  onPageChange,
  children,
}: SwipeablePagesProps) {
  const currentIndex = PAGE_ORDER.indexOf(currentPage)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < PAGE_ORDER.length - 1) {
        onPageChange(PAGE_ORDER[currentIndex + 1])
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        onPageChange(PAGE_ORDER[currentIndex - 1])
      }
    },
    trackMouse: true,
    trackTouch: true,
    delta: 50,
  })

  const translateX = -currentIndex * 33.333

  return (
    <Box
      {...handlers}
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

import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useSwipeable } from 'react-swipeable'
import { ReactNode, useRef, useCallback } from 'react'

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
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wheelDeltaRef = useRef(0)

  const navigateToPage = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < PAGE_ORDER.length - 1) {
      onPageChange(PAGE_ORDER[currentIndex + 1])
    } else if (direction === 'right' && currentIndex > 0) {
      onPageChange(PAGE_ORDER[currentIndex - 1])
    }
  }, [currentIndex, onPageChange])

  const handlers = useSwipeable({
    onSwipedLeft: () => navigateToPage('left'),
    onSwipedRight: () => navigateToPage('right'),
    trackMouse: true,
    trackTouch: true,
    delta: 50,
  })

  const handleWheel = useCallback((event: React.WheelEvent) => {
    // Only handle horizontal scrolling or when shift is held for vertical scroll
    const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    const deltaX = isHorizontal ? event.deltaX : (event.shiftKey ? event.deltaY : 0)

    if (Math.abs(deltaX) < 10) return // Ignore small deltas

    event.preventDefault()

    // Accumulate wheel delta for smoother detection
    wheelDeltaRef.current += deltaX

    // Clear existing timeout
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current)
    }

    // Set timeout to reset delta accumulation
    wheelTimeoutRef.current = setTimeout(() => {
      wheelDeltaRef.current = 0
    }, 150)

    // Trigger navigation when threshold is reached
    const threshold = 100
    if (Math.abs(wheelDeltaRef.current) >= threshold) {
      if (wheelDeltaRef.current > 0) {
        navigateToPage('left')
      } else {
        navigateToPage('right')
      }
      wheelDeltaRef.current = 0
    }
  }, [navigateToPage])

  const translateX = -currentIndex * 33.333

  return (
    <Box
      {...handlers}
      onWheel={handleWheel}
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

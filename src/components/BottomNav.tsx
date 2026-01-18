import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { PageType } from './SwipeablePages.js'

const NavContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '80px',
  backgroundColor: '#1A1B4B',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingTop: '10px',
  paddingLeft: '16px',
  paddingRight: '16px',
})

const NavButton = styled(Box)<{ active?: boolean }>(({ active }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60px',
  height: '60px',
  cursor: 'pointer',
  opacity: active ? 1 : 0.5,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 1,
  },
}))

const ButtonIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.7062 0C9.52251 0 6.94162 2.27927 6.94162 5.09091C6.94162 7.11855 8.29383 8.85439 10.2357 9.6733V5.09091C10.2357 3.88655 11.3425 2.90909 12.7062 2.90909C14.07 2.90909 15.1768 3.88655 15.1768 5.09091V9.6733C17.1186 8.85439 18.4708 7.11855 18.4708 5.09091C18.4708 2.27927 15.8899 0 12.7062 0ZM15.1768 9.6733C14.4257 9.99039 13.594 10.1818 12.7062 10.1818C11.8185 10.1818 10.9867 9.99039 10.2357 9.6733V21.9063L5.85111 19.9432C4.93207 19.5315 3.82419 19.626 3.01385 20.1875C1.76376 21.0544 1.65253 22.6927 2.7758 23.6847L10.7439 30.7216C11.6712 31.5405 12.9281 32 14.2374 32H25.0589C27.788 32 30 30.0465 30 27.6364V17.7358C30 16.3147 28.8341 15.1007 27.2464 14.8665L15.1768 13.0909V9.6733Z" fill="#A68743"/>
  </svg>
)

interface BottomNavProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const nextPage: PageType = currentPage === 'home' ? 'button' : 'home'
  return (
    <>
      <NavContainer>
        <NavButton active onClick={() => onNavigate(nextPage)}>
          {currentPage === 'home' ? <ButtonIcon /> : <CloseIcon sx={{ color: '#A68743', fontSize: 32 }} />}
        </NavButton>
      </NavContainer>
    </>
  )
}

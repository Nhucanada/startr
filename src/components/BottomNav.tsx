import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const NavContainer = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '80px',
  backgroundColor: '#1A1B4B',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingBottom: '10px',
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

const HomeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_78_45)">
      <path d="M10.7057 4C9.8444 4 9.03646 4.41585 8.53646 5.11719L3.41927 12.2786C3.10327 12.72 3.42088 13.3333 3.96355 13.3333H4V26.6667C4.00004 27.0203 4.14053 27.3594 4.39057 27.6094C4.64061 27.8595 4.97973 28 5.33334 28H26.6667C27.0203 28 27.3594 27.8595 27.6094 27.6094C27.8595 27.3594 28 27.0203 28 26.6667V13.3333H28.0365C28.5791 13.3333 28.8967 12.72 28.5807 12.2786L23.4635 5.11719C22.9635 4.41719 22.1556 4 21.2943 4H10.7057ZM11.3333 6.79948L15.2031 12.2161C15.7031 12.9175 16.5111 13.3333 17.3724 13.3333H25.3333V25.3333H14.6667V18.6667C14.6667 17.9307 14.0693 17.3333 13.3333 17.3333H10.6667C9.93067 17.3333 9.33334 17.9307 9.33334 18.6667V25.3333H6.66667V13.3333L11.3333 6.79948ZM18.6667 17.3333C17.9307 17.3333 17.3333 17.9307 17.3333 18.6667V21.3333C17.3333 22.0693 17.9307 22.6667 18.6667 22.6667H21.3333C22.0693 22.6667 22.6667 22.0693 22.6667 21.3333V18.6667C22.6667 17.9307 22.0693 17.3333 21.3333 17.3333H18.6667Z" fill="#A68743"/>
    </g>
    <defs>
      <clipPath id="clip0_78_45">
        <rect width="32" height="32" fill="white"/>
      </clipPath>
    </defs>
  </svg>
)

const ButtonIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.7062 0C9.52251 0 6.94162 2.27927 6.94162 5.09091C6.94162 7.11855 8.29383 8.85439 10.2357 9.6733V5.09091C10.2357 3.88655 11.3425 2.90909 12.7062 2.90909C14.07 2.90909 15.1768 3.88655 15.1768 5.09091V9.6733C17.1186 8.85439 18.4708 7.11855 18.4708 5.09091C18.4708 2.27927 15.8899 0 12.7062 0ZM15.1768 9.6733C14.4257 9.99039 13.594 10.1818 12.7062 10.1818C11.8185 10.1818 10.9867 9.99039 10.2357 9.6733V21.9063L5.85111 19.9432C4.93207 19.5315 3.82419 19.626 3.01385 20.1875C1.76376 21.0544 1.65253 22.6927 2.7758 23.6847L10.7439 30.7216C11.6712 31.5405 12.9281 32 14.2374 32H25.0589C27.788 32 30 30.0465 30 27.6364V17.7358C30 16.3147 28.8341 15.1007 27.2464 14.8665L15.1768 13.0909V9.6733Z" fill="#A68743"/>
  </svg>
)

interface BottomNavProps {
  currentPage: 'home' | 'button'
  onNavigate: (page: 'home' | 'button') => void
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <NavContainer>
      <NavButton active={currentPage === 'home'} onClick={() => onNavigate('home')}>
        <HomeIcon />
      </NavButton>
      <NavButton active={currentPage === 'button'} onClick={() => onNavigate('button')}>
        <ButtonIcon />
      </NavButton>
    </NavContainer>
  )
}

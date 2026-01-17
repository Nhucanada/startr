import { useState } from 'react'
import HabitTracker from './components/HabitTracker.js'
import ButtonPage from './components/ButtonPage.js'
import CameraPopup from './components/CameraPopup.js'

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'button'>('home')
  const [showCameraPopup, setShowCameraPopup] = useState(false)

  const handleNavigate = (page: 'home' | 'button') => {
    setCurrentPage(page)
  }

  const handleButtonClick = () => {
    setShowCameraPopup(true)
  }

  const handleCloseCameraPopup = () => {
    setShowCameraPopup(false)
  }

  return (
    <>
      {currentPage === 'button' ? (
        <ButtonPage
          onButtonClick={handleButtonClick}
          onNavigate={handleNavigate}
        />
      ) : (
        <HabitTracker onNavigate={handleNavigate} />
      )}

      {showCameraPopup && (
        <CameraPopup onClose={handleCloseCameraPopup} />
      )}
    </>
  )
}

export default App
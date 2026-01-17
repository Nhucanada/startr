import { useState } from 'react'
import HabitTracker from './components/HabitTracker.js'
import ButtonPage from './components/ButtonPage.js'
import CameraPopup from './components/CameraPopup.js'

function App() {
  const [showButtonPage, setShowButtonPage] = useState(false)
  const [showCameraPopup, setShowCameraPopup] = useState(false)

  const handleLockClick = () => {
    setShowButtonPage(true)
  }

  const handleBackClick = () => {
    setShowButtonPage(false)
  }

  const handleButtonClick = () => {
    setShowCameraPopup(true)
  }

  const handleCloseCameraPopup = () => {
    setShowCameraPopup(false)
  }

  return (
    <>
      {showButtonPage ? (
        <ButtonPage
          onBackClick={handleBackClick}
          onButtonClick={handleButtonClick}
        />
      ) : (
        <HabitTracker onLockClick={handleLockClick} />
      )}

      {showCameraPopup && (
        <CameraPopup onClose={handleCloseCameraPopup} />
      )}
    </>
  )
}

export default App
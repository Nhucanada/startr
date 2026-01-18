import { useEffect, useRef, useState } from 'react'
import { Box, Typography, IconButton, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'

const PopupOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
})

const PopupContainer = styled(Box)({
  width: '90vw',
  maxWidth: '400px',
  height: '60vh',
  maxHeight: '500px',
  backgroundColor: '#2A2E5A',
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
})

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
})

const VideoContainer = styled(Box)({
  flex: 1,
  backgroundColor: '#1A1A1A',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '40px',
})

const Video = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transform: 'scaleX(-1)', // Mirror the video horizontally
})

const LoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF',
})

const ErrorText = styled(Typography)({
  color: '#FF6B6B',
  textAlign: 'center',
  marginTop: '20px',
})

const CountdownOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
})

const CountdownText = styled(Typography)({
  fontSize: '80px',
  fontWeight: 'bold',
  color: '#FFFFFF',
  textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
})

const CaptureMessage = styled(Typography)({
  color: '#4CAF50',
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '18px',
})

interface CameraPopupProps {
  onClose: () => void
}

export default function CameraPopup({ onClose }: CameraPopupProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [captured, setCaptured] = useState(false)

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('Camera track stopped:', track.kind)
      })
      streamRef.current = null
    }
  }

  useEffect(() => {
    const startCamera = async () => {
      try {
        setLoading(true)
        setError('')

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // Front camera
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          streamRef.current = mediaStream
          setLoading(false)

          // Start countdown after camera loads
          setTimeout(() => startCountdown(), 1000)
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        setError('Unable to access camera. Please check permissions.')
        setLoading(false)
      }
    }

    startCamera()

    // Cleanup function to stop camera when component unmounts
    return () => {
      stopCamera()
    }
  }, [])

  const startCountdown = () => {
    setCountdown(3)

    // Schedule each countdown step explicitly
    setTimeout(() => setCountdown(2), 1000)
    setTimeout(() => setCountdown(1), 2000)
    setTimeout(() => setCountdown(0), 3000) // Show camera icon
    setTimeout(() => {
      takePicture()
      setCountdown(null)
    }, 4000) // Take picture after showing camera icon
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to blob and save to cache
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = new Date().getTime()
            const fileName = `photo_${timestamp}.jpg`

            // Save to browser cache using localStorage (for demo)
            // In production, you might use IndexedDB or a more robust storage solution
            const reader = new FileReader()
            reader.onload = () => {
              const base64String = reader.result as string
              localStorage.setItem(`camera_photo_${timestamp}`, base64String)
              console.log(`Photo saved as ${fileName}`)
            }
            reader.readAsDataURL(blob)

            setCaptured(true)

            // Stop camera immediately after capture
            stopCamera()

            // Close popup after 2 seconds
            setTimeout(() => {
              onClose()
            }, 2000)
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <PopupOverlay onClick={handleClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <CloseIcon />
        </CloseButton>

        <VideoContainer>
          {loading && (
            <LoadingContainer>
              <CircularProgress sx={{ color: '#FFFFFF', mb: 2 }} />
              <Typography color="inherit">Starting camera...</Typography>
            </LoadingContainer>
          )}

          {error && (
            <LoadingContainer>
              <ErrorText>{error}</ErrorText>
            </LoadingContainer>
          )}

          <Video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ display: loading || error ? 'none' : 'block' }}
          />

          {countdown !== null && countdown > 0 && (
            <CountdownOverlay>
              <CountdownText>{countdown}</CountdownText>
            </CountdownOverlay>
          )}

          {countdown === 0 && (
            <CountdownOverlay>
              <CountdownText>📸</CountdownText>
            </CountdownOverlay>
          )}
        </VideoContainer>

        {captured && (
          <CaptureMessage>
            📸 Photo captured and saved to cache!
          </CaptureMessage>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </PopupContainer>
    </PopupOverlay>
  )
}
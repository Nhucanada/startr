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

const CapturedImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

interface CameraPopupProps {
  onClose: () => void
}

export default function CameraPopup({ onClose }: CameraPopupProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [captured, setCaptured] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null)

  const stopCamera = () => {
    // Clear any pending timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []

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
    // Clear any existing timeouts first
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []

    setCountdown(3)

    // Schedule each countdown step explicitly and store timeout IDs
    const timeout1 = setTimeout(() => setCountdown(2), 1000)
    const timeout2 = setTimeout(() => setCountdown(1), 2000)
    const timeout3 = setTimeout(() => setCountdown(0), 3000) // Show camera icon
    const timeout4 = setTimeout(() => {
      if (!captured && !isCapturing) {
        takePicture()
        setCountdown(null)
      }
    }, 4000) // Take picture after showing camera icon

    timeoutsRef.current = [timeout1, timeout2, timeout3, timeout4]
  }

  const takePicture = () => {
    // Prevent multiple captures
    if (isCapturing || captured) {
      console.log('Already capturing or captured, skipping...')
      return
    }

    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true)
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Check if video has loaded and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video not ready for capture')
        setIsCapturing(false)
        return
      }

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Mirror the image horizontally to match what user sees
        context.scale(-1, 1)
        context.translate(-canvas.width, 0)

        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Reset transformation for next use
        context.setTransform(1, 0, 0, 1, 0, 0)

        // Convert to blob and save to cache
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = new Date().getTime()
            const storageKey = `camera_photo_${timestamp}`

            try {
              // Save to browser cache using localStorage (for demo)
              const reader = new FileReader()
              reader.onload = () => {
                try {
                  const base64String = reader.result as string
                  localStorage.setItem(storageKey, base64String)
                  console.log(`Photo saved with key: ${storageKey}`)
                  console.log(`Photo data length: ${base64String.length}`)

                  // Store the image URL for preview
                  setCapturedImageUrl(base64String)

                  // Verify it was saved
                  const saved = localStorage.getItem(storageKey)
                  if (saved) {
                    console.log('✅ Photo successfully saved and verified')
                  } else {
                    console.error('❌ Photo not found after saving')
                  }
                } catch (saveError) {
                  console.error('Error saving photo:', saveError)
                }
              }
              reader.onerror = () => {
                console.error('Error reading blob')
                setIsCapturing(false)
              }
              reader.readAsDataURL(blob)

              setCaptured(true)

              // Clear any remaining timeouts after successful capture
              timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
              timeoutsRef.current = []

              // Stop camera immediately after capture
              stopCamera()

              // Close popup after 2 seconds
              setTimeout(() => {
                onClose()
              }, 2000)
            } catch (error) {
              console.error('Error processing photo:', error)
              setIsCapturing(false)
            }
          } else {
            console.error('Failed to create blob')
            setIsCapturing(false)
          }
        }, 'image/jpeg', 0.8)
      } else {
        console.error('Canvas context not available')
        setIsCapturing(false)
      }
    } else {
      console.error('Video or canvas not available')
      setIsCapturing(false)
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
            style={{ display: loading || error || captured ? 'none' : 'block' }}
          />

          {captured && capturedImageUrl && (
            <CapturedImage
              src={capturedImageUrl}
              alt="Captured photo"
            />
          )}

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
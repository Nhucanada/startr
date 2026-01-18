import { useEffect, useRef, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import { trpc } from '../utils/trpc'

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

const CaptionOverlay = styled(Box)({
  position: 'absolute',
  left: '16px',
  right: '16px',
  bottom: '16px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '10px 12px',
  borderRadius: '10px',
})

const CaptionText = styled(Typography)({
  fontSize: '16px',
  fontWeight: '600',
  color: '#FFFFFF',
})

const CaptureMessage = styled(Typography)({
  color: '#4CAF50',
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '18px',
})

const UploadMessage = styled(Typography)({
  color: '#2196F3',
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '16px',
})

const UploadSuccess = styled(Typography)({
  color: '#4CAF50',
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '16px',
})

const UploadError = styled(Typography)({
  color: '#FF6B6B',
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '16px',
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
  const uploadImage = trpc.user.uploadImage.useMutation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasCapturedRef = useRef(false)
  const isCapturingRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCaption, setShowCaption] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const stopCamera = () => {
    // Clear any pending timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current)
      startTimeoutRef.current = null
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

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

          // Wait 3 seconds after camera loads, then capture
          setShowCaption(true)
          if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current)
          }
          startTimeoutRef.current = setTimeout(() => {
            if (hasCapturedRef.current || isCapturingRef.current) {
              setShowCaption(false)
              return
            }
            takePicture()
            setShowCaption(false)
          }, 3000)
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

  const takePicture = () => {
    // Prevent multiple captures
    if (isCapturingRef.current || hasCapturedRef.current || isCapturing || captured) {
      console.log('Already capturing or captured, skipping...')
      return
    }
    isCapturingRef.current = true

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

                  // Upload to backend
                  uploadToBackend(base64String)
                } catch (saveError) {
                  console.error('Error saving photo:', saveError)
                }
              }
              reader.onerror = () => {
                console.error('Error reading blob')
                setIsCapturing(false)
                isCapturingRef.current = false
              }
              reader.readAsDataURL(blob)

              setCaptured(true)
              hasCapturedRef.current = true
              isCapturingRef.current = false

              // Clear any remaining timeouts after successful capture
              timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
              timeoutsRef.current = []
              if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current)
                startTimeoutRef.current = null
              }

              // Stop camera immediately after capture
              stopCamera()
            } catch (error) {
              console.error('Error processing photo:', error)
              setIsCapturing(false)
              isCapturingRef.current = false
            }
          } else {
            console.error('Failed to create blob')
            setIsCapturing(false)
            isCapturingRef.current = false
          }
        }, 'image/jpeg', 0.8)
      } else {
        console.error('Canvas context not available')
        setIsCapturing(false)
        isCapturingRef.current = false
      }
    } else {
      console.error('Video or canvas not available')
      setIsCapturing(false)
      isCapturingRef.current = false
    }
  }

  const uploadToBackend = async (imageData: string) => {
    try {
      setIsUploading(true)
      setUploadError('')

      const result = await uploadImage.mutateAsync({
        image: imageData,
        bucketName: 'panic_images'
      })

      if (result.success) {
        setUploadSuccess(true)

        // Close popup after successful upload
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current)
        }
        closeTimeoutRef.current = setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setUploadError('Upload was not successful')
      }
    } catch (error) {
      console.error('Upload failed with error:', error)
      setUploadError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }


  return (
    <PopupOverlay>
      <PopupContainer>
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

          {showCaption && (
            <CaptionOverlay>
              <CaptionText>Look at yourself in the mirror...</CaptionText>
            </CaptionOverlay>
          )}
        </VideoContainer>

        {captured && !isUploading && !uploadSuccess && !uploadError && (
          <CaptureMessage>
            📸 Now lets see what you'll become...
          </CaptureMessage>
        )}

        {isUploading && (
          <UploadMessage>
            📤 Uploading your image...
          </UploadMessage>
        )}

        {uploadSuccess && (
          <UploadSuccess>
            ✅ Upload complete! Closing...
          </UploadSuccess>
        )}

        {uploadError && (
          <UploadError>
            ❌ {uploadError}
          </UploadError>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </PopupContainer>
    </PopupOverlay>
  )
}
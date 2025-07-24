'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { uploadImage, UploadResult } from '@/lib/fileUpload'

interface PhotoUploadProps {
  onImageSelected: (imageUrl: string) => void
  onImageRemoved: () => void
  currentImage?: string
  placeholder?: string
  disabled?: boolean
  showCamera?: boolean
  maxWidth?: number
  maxHeight?: number
}

export function PhotoUpload({
  onImageSelected,
  onImageRemoved,
  currentImage,
  placeholder = "Add photo proof",
  disabled = false,
  showCamera = true,
  maxWidth = 400,
  maxHeight = 300
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const result: UploadResult = await uploadImage(file)
      
      if (result.success && result.url) {
        onImageSelected(result.url)
      } else {
        setUploadError(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    onImageRemoved()
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {!currentImage ? (
        <Card className="border-2 border-dashed border-slate-300 hover:border-sage-green/50 transition-colors">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8 text-black" />
              </div>
              
              <div>
                <h3 className="font-medium text-black mb-1">{placeholder}</h3>
                <p className="text-sm text-black">
                  Take a photo or upload from your device
                </p>
              </div>

              {/* Upload Buttons */}
              <div className="flex gap-2 justify-center">
                {showCamera && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCamera}
                    disabled={disabled || isUploading}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Camera
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openFileSelector}
                  disabled={disabled || isUploading}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </div>

              {/* Loading State */}
              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-sm text-black">
                  <div className="w-4 h-4 border-2 border-sage-green border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              )}

              {/* Error State */}
              {uploadError && (
                <div className="flex items-center justify-center gap-2 text-sm text-error">
                  <AlertCircle className="w-4 h-4" />
                  {uploadError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Image Preview */
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div className="relative group">
              <img
                src={currentImage}
                alt="Uploaded proof"
                className="w-full h-auto max-h-64 object-cover rounded-lg"
                style={{ maxWidth: maxWidth, maxHeight: maxHeight }}
              />
              
              {/* Remove Button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Success Indicator */}
              <div className="absolute bottom-2 left-2">
                <div className="bg-success text-white rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      {showCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-black/60 text-center">
        Max file size: 5MB • Supported: JPEG, PNG, GIF, WebP
      </div>
    </div>
  )
}
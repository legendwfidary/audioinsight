"use client"

import { useCallback, useState } from "react"
import { Upload, Music, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string[]
  maxSizeMB?: number
  selectedFile?: File | null
  onRemoveFile?: () => void
}

export function FileUploadZone({
  onFileSelect,
  acceptedTypes = [".mp3", ".wav"],
  maxSizeMB = 50,
  selectedFile,
  onRemoveFile,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback(
    (file: File) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase()
      if (!acceptedTypes.includes(extension)) {
        return `Invalid file type. Please upload ${acceptedTypes.join(" or ")} files.`
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File too large. Maximum size is ${maxSizeMB}MB.`
      }
      return null
    },
    [acceptedTypes, maxSizeMB]
  )

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setError(null)
      onFileSelect(file)
    },
    [validateFile, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB"
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (selectedFile) {
    return (
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          {onRemoveFile && (
            <button
              onClick={onRemoveFile}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50",
          error && "border-destructive"
        )}
      >
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Upload audio file"
        />
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary/20" : "bg-secondary"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <p className="mb-2 text-center text-lg font-medium text-foreground">
          {isDragging ? "Drop your file here" : "Drag & drop your audio file"}
        </p>
        <p className="text-center text-sm text-muted-foreground">
          or click to browse
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Supported formats: MP3, WAV • Max size: {maxSizeMB}MB
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

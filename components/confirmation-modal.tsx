"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  theme?: "blue" | "green" | "red"
  isLoading?: boolean
  variant?: "default" | "destructive"
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  theme = "blue",
  isLoading = false,
  variant = "default"
}: ConfirmationModalProps) {
  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  const getConfirmButtonColor = () => {
    if (variant === "destructive") {
      return "#D32F2F"
    }
    return themeColors[theme]
  }

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            style={{ backgroundColor: getConfirmButtonColor() }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
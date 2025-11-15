import * as React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}: ModalProps) {
  const { t } = useTranslation()
  
  // Use translated defaults if not provided
  const modalTitle = title ?? t("modal.defaultTitle")
  const modalConfirmText = confirmText ?? t("modal.defaultConfirm")
  const modalCancelText = cancelText ?? t("modal.defaultCancel")
  
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "dark"
  })

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    const interval = setInterval(() => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      if (savedTheme && savedTheme !== theme) {
        setTheme(savedTheme)
      }
    }, 100)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [theme])

  // Theme-aware color helpers
  const getModalBg = () => {
    if (theme === "light") return "bg-white"
    return "bg-[#282C34]"
  }

  const getBorderColor = () => {
    if (theme === "light") return "border-gray-200"
    return "border-[#3E4451]"
  }

  const getTextColor = () => {
    if (theme === "light") return "text-gray-800"
    return "text-[#E0E0E0]"
  }

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#ABB2BF]"
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          `${getModalBg()} border ${getBorderColor()} rounded-lg shadow-lg p-6 max-w-md w-full mx-4`,
          "transition-all duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {modalTitle && (
          <h2 className={`text-xl font-semibold ${getTextColor()} mb-4`}>{modalTitle}</h2>
        )}
        <p className={`text-sm ${getMutedText()} mb-6`}>{message}</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            {modalCancelText}
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="cursor-pointer"
          >
            {modalConfirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}


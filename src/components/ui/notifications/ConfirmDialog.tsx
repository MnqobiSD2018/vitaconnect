"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ConfirmOptions } from "./NotificationProvider"

interface ConfirmDialogProps extends ConfirmOptions {
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const handleConfirm = useCallback(() => {
    setExiting(true)
    setTimeout(onConfirm, 150)
  }, [onConfirm])

  const handleCancel = useCallback(() => {
    setExiting(true)
    setTimeout(onCancel, 150)
  }, [onCancel])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    cancelRef.current?.focus()
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [handleCancel])

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-150",
          visible && !exiting ? "opacity-100" : "opacity-0"
        )}
        onClick={handleCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className={cn(
          "relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-150 dark:border-slate-700 dark:bg-slate-900",
          visible && !exiting
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        )}
      >
        <div className="flex items-start gap-4">
          {variant === "destructive" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2
              id="confirm-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h2>
            <p
              id="confirm-description"
              className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

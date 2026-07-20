"use client"

import React, { useEffect, useState } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationType } from "./NotificationProvider"

interface ToastProps {
  id: string
  type: NotificationType
  message: string
  duration?: number
  onDismiss: (id: string) => void
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
}

const colorMap: Record<NotificationType, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  error:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  info:
    "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
}

const iconColorMap: Record<NotificationType, string> = {
  success: "text-emerald-500 dark:text-emerald-400",
  error: "text-rose-500 dark:text-rose-400",
  warning: "text-amber-500 dark:text-amber-400",
  info: "text-slate-500 dark:text-slate-400",
}

export function Toast({ id, type, message, duration = 5000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(id), 200)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, id, onDismiss])

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => onDismiss(id), 200)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg transition-all duration-200",
        colorMap[type],
        visible && !exiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span className={cn("mt-0.5 shrink-0", iconColorMap[type])}>
          {iconMap[type]}
        </span>
        <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
        <button
          onClick={handleClose}
          className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

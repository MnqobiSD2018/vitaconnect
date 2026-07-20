"use client"

import React, { createContext, useCallback, useRef, useState } from "react"
import { NotificationContainer } from "./NotificationContainer"
import { ConfirmDialog } from "./ConfirmDialog"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "destructive" | "default"
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

interface NotificationContextValue {
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
  dismiss: (id: string) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)

let counter = 0
function nextId() {
  return `notification-${++counter}-${Date.now()}`
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null)

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration = 5000) => {
      const id = nextId()
      setNotifications((prev) => [...prev, { id, type, message, duration }])
      return id
    },
    []
  )

  const success = useCallback(
    (message: string, duration?: number) => addNotification("success", message, duration ?? 4000),
    [addNotification]
  )

  const error = useCallback(
    (message: string, duration?: number) => addNotification("error", message, duration ?? 6000),
    [addNotification]
  )

  const warning = useCallback(
    (message: string, duration?: number) => addNotification("warning", message, duration ?? 5000),
    [addNotification]
  )

  const info = useCallback(
    (message: string, duration?: number) => addNotification("info", message, duration ?? 5000),
    [addNotification]
  )

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      confirmResolveRef.current = resolve
      setConfirmState({ ...options, resolve })
    })
  }, [])

  const handleConfirmResult = useCallback((result: boolean) => {
    confirmResolveRef.current?.(result)
    confirmResolveRef.current = null
    setConfirmState(null)
  }, [])

  return (
    <NotificationContext.Provider value={{ success, error, warning, info, confirm, dismiss }}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
      {confirmState && (
        <ConfirmDialog
          {...confirmState}
          onConfirm={() => handleConfirmResult(true)}
          onCancel={() => handleConfirmResult(false)}
        />
      )}
    </NotificationContext.Provider>
  )
}

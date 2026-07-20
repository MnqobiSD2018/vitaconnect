"use client"

import React from "react"
import { Toast } from "./Toast"
import type { Notification } from "./NotificationProvider"

interface NotificationContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  if (notifications.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2 sm:max-w-sm"
    >
      {notifications.map((n) => (
        <Toast
          key={n.id}
          id={n.id}
          type={n.type}
          message={n.message}
          duration={n.duration}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

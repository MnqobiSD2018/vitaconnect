"use client"

import { NotificationProvider } from "@/components/ui/notifications"

export function Providers({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>
}

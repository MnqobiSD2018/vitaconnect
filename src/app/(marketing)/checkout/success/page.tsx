"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { getOrderByReference } from "@/actions/tickets"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const status = searchParams.get("status")

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reference) {
      setLoading(false)
      return
    }

    getOrderByReference(reference)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    )
  }

  const paid = status?.toLowerCase() === "paid"

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border p-8 text-center space-y-5 shadow-sm"
        style={{ borderColor: paid ? "#a7f3d0" : "#fecaca" }}
      >
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${
          paid ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
        }`}>
          {paid ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          {paid ? "Payment Successful!" : "Payment Pending"}
        </h2>

        {order && (
          <p className="text-sm text-slate-500">
            Order: <span className="font-bold text-slate-900">{order.order_number}</span>
          </p>
        )}

        <p className="text-sm text-slate-500">
          {paid
            ? "Your tickets are confirmed. A confirmation will be sent to your email."
            : "Your payment is being processed. You will receive a confirmation once completed."}
        </p>

        <div className="flex flex-col gap-3 pt-2">
          {order && (
            <Link
              href={`/dashboard/tickets/${order.id}`}
              className="w-full h-12 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
            >
              View Tickets
            </Link>
          )}
          <Link
            href="/dashboard/tickets"
            className="w-full h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
          >
            My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
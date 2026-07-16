'use client'

import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import mainLogo from "@/app/media/vc-white.svg"
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators/user'
import { resetPassword } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError('')
    const { error } = await resetPassword(data.email)
    if (error) {
      setServerError(error)
      return
    }
    setSubmittedEmail(data.email)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center">
              <Image src={mainLogo} alt="VitaConnect" width={28} height={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">VitaConnect</h2>
              <p className="text-sm text-slate-500">Zimbabwe&apos;s Ticketing Platform</p>
            </div>
          </Link>

          {!isSubmitted ? (
            <>
              {/* Heading */}
              <h1 className="text-5xl font-bold text-slate-900">Reset Password</h1>
              <p className="mt-3 text-lg text-slate-500">
                Enter your email address and we&apos;ll send you a link to securely reset your password.
              </p>

              {/* Error */}
              {serverError && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
                {/* Email */}
                <div>
                  <label className="block mb-2 font-medium text-slate-800">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      {...register('email')}
                      className="w-full rounded-xl border border-slate-300 py-4 pl-12 pr-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-600"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 py-4 text-white text-lg font-semibold transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link →'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="mt-10 space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                <CheckCircle2 className="h-10 w-10 text-teal-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Check your email</h1>
              <p className="text-lg text-slate-500">
                We sent a password reset link to <br />
                <span className="font-medium text-slate-900">{submittedEmail}</span>
              </p>
              <button
                onClick={() => { setIsSubmitted(false); setServerError('') }}
                className="text-sm font-semibold text-teal-600 hover:underline mt-4 block mx-auto"
              >
                Didn&apos;t receive the email? Click to resend.
              </button>
            </div>
          )}

          {/* Back to Sign In */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-600 to-slate-200">
        <div className="text-center text-white max-w-lg">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
            <Image src={mainLogo} alt="Logo" width={50} height={50} />
          </div>
          <h2 className="text-5xl font-bold">
            Secure Your<br />Account
          </h2>
          <p className="mt-6 text-xl text-slate-200 leading-relaxed">
            Quickly recover your access so you don&apos;t miss out on upcoming concerts, conferences, and festivals across Zimbabwe.
          </p>
        </div>
      </div>
    </div>
  )
}

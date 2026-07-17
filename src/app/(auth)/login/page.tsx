'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import mainLogo from "@/app/media/vc-white.svg"
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validators/user'
import { signIn } from '@/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError('')
    const result = await signIn({ email: data.email, password: data.password })
    if (result.error) {
      setServerError(result.error)
      return
    }
    // Redirect based on role, unless there's an explicit redirect param
    const searchRedirect = searchParams.get('redirect')
    if (searchRedirect) {
      router.push(searchRedirect)
    } else {
      const role = result.role || 'attendee'
      if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'organizer') {
        router.push('/organizer')
      } else if (role === 'needs_onboarding') {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
    router.refresh()
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

          {/* Heading */}
          <h1 className="text-5xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-3 text-lg text-slate-500">Sign in to continue your event journey.</p>

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
                  placeholder="your@email.com"
                  {...register('email')}
                  className="w-full rounded-xl border border-slate-300 py-4 pl-12 pr-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-600"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium text-slate-800">Password</label>
                <Link href="/forgot-password" className="text-gray-900 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  placeholder="Enter password"
                  {...register('password')}
                  className="w-full rounded-xl border border-slate-300 py-4 pl-12 pr-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-600"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
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
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="border-t border-slate-300"></div>
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-slate-400">
              Or continue with
            </span>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-4">
            <button className="border rounded-xl py-3 hover:bg-slate-50 text-slate-800">Google</button>
            <button className="border rounded-xl py-3 hover:bg-slate-50 text-slate-800">Microsoft</button>
          </div>

          {/* Sign Up */}
          <p className="mt-10 text-center text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-teal-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-600 to-slate-200">
        <div className="text-center text-white max-w-lg">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
            <Image src={mainLogo} alt="Logo" width={50} height={50} />
          </div>
          <h2 className="text-5xl font-bold">
            Your Gateway<br />to Great Events
          </h2>
          <p className="mt-6 text-xl text-slate-200 leading-relaxed">
            Discover concerts, conferences, festivals and community events
            across Zimbabwe. Secure your tickets in seconds with VitaConnect.
          </p>
        </div>
      </div>
    </div>
  )
}

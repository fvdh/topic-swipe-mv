"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface EnvironmentStatus {
  hasUrl: boolean
  hasAnonKey: boolean
  hasServiceKey: boolean
  isLoading: boolean
}

export function EnvironmentCheck() {
  const [status, setStatus] = useState<EnvironmentStatus>({
    hasUrl: false,
    hasAnonKey: false,
    hasServiceKey: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    setStatus({
      hasUrl,
      hasAnonKey,
      hasServiceKey,
      isLoading: false,
    })
  }, [])

  if (status.isLoading) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking environment...</span>
      </div>
    )
  }

  const allRequired = status.hasUrl && status.hasAnonKey
  const allOptional = allRequired && status.hasServiceKey

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {allOptional ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : allRequired ? (
          <CheckCircle className="w-4 h-4 text-orange-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
        <span className="text-sm font-medium">
          {allOptional && "All environment variables configured"}
          {allRequired && !allOptional && "Required variables configured"}
          {!allRequired && "Environment variables missing"}
        </span>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          {status.hasUrl ? (
            <CheckCircle className="w-3 h-3 text-green-600" />
          ) : (
            <AlertCircle className="w-3 h-3 text-red-600" />
          )}
          <span>NEXT_PUBLIC_SUPABASE_URL</span>
        </div>
        <div className="flex items-center gap-2">
          {status.hasAnonKey ? (
            <CheckCircle className="w-3 h-3 text-green-600" />
          ) : (
            <AlertCircle className="w-3 h-3 text-red-600" />
          )}
          <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
        </div>
        <div className="flex items-center gap-2">
          {status.hasServiceKey ? (
            <CheckCircle className="w-3 h-3 text-green-600" />
          ) : (
            <AlertCircle className="w-3 h-3 text-orange-600" />
          )}
          <span>SUPABASE_SERVICE_ROLE_KEY (optional)</span>
        </div>
      </div>
    </div>
  )
}

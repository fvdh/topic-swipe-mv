"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EnvironmentStatus {
  [key: string]: {
    present: boolean
    value?: string
  }
}

export function EnvironmentCheck() {
  const [status, setStatus] = useState<EnvironmentStatus>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnvironment = async () => {
      setLoading(true)

      // Check client-side environment variables
      const clientStatus: EnvironmentStatus = {
        NEXT_PUBLIC_SUPABASE_URL: {
          present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "••••••••" : undefined,
        },
      }

      // Check server-side environment variables via API
      try {
        const response = await fetch("/api/test-db")
        const data = await response.json()

        if (data.envMissing) {
          clientStatus.SUPABASE_SERVICE_ROLE_KEY = {
            present: false,
          }
        } else {
          clientStatus.SUPABASE_SERVICE_ROLE_KEY = {
            present: true,
            value: "••••••••",
          }
        }
      } catch (error) {
        clientStatus.SUPABASE_SERVICE_ROLE_KEY = {
          present: false,
        }
      }

      setStatus(clientStatus)
      setLoading(false)
    }

    checkEnvironment()
  }, [])

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span>Checking environment...</span>
        </CardContent>
      </Card>
    )
  }

  const allPresent = Object.values(status).every((env) => env.present)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          {allPresent ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          Environment Status
        </h3>

        <div className="space-y-3">
          {Object.entries(status).map(([key, env]) => (
            <div key={key} className="flex items-center justify-between">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{key}</code>
              <div className="flex items-center gap-2">
                {env.present ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Set</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">Missing</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {!allPresent && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-700">
              Some environment variables are missing. Please check your <code>.env.local</code> file.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

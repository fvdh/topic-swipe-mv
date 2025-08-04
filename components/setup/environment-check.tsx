"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react"

interface EnvStatus {
  name: string
  present: boolean
  value?: string
  masked?: boolean
}

export function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnvironment = () => {
      const requiredEnvs = [
        {
          name: "NEXT_PUBLIC_SUPABASE_URL",
          value: process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
        {
          name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          masked: true,
        },
        {
          name: "SUPABASE_SERVICE_ROLE_KEY",
          value: process.env.SUPABASE_SERVICE_ROLE_KEY,
          masked: true,
        },
      ]

      const status = requiredEnvs.map((env) => ({
        name: env.name,
        present: !!env.value,
        value: env.value,
        masked: env.masked,
      }))

      setEnvStatus(status)
      setLoading(false)
    }

    checkEnvironment()
  }, [])

  const allPresent = envStatus.every((env) => env.present)
  const missingCount = envStatus.filter((env) => !env.present).length

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span>Checking environment variables...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Environment Status
              {allPresent ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </CardTitle>
            <CardDescription>
              {allPresent
                ? "All required environment variables are configured"
                : `${missingCount} environment variable${missingCount > 1 ? "s" : ""} missing`}
            </CardDescription>
          </div>
          <Badge variant={allPresent ? "default" : "destructive"}>
            {envStatus.filter((env) => env.present).length}/{envStatus.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allPresent && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Missing environment variables detected. Please configure them in your <code>.env.local</code> file.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {envStatus.map((env) => (
            <div key={env.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {env.present ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <div className="font-medium">{env.name}</div>
                  {env.present && env.value && (
                    <div className="text-sm text-gray-500 font-mono">
                      {env.masked ? `${env.value.substring(0, 20)}...` : env.value}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant={env.present ? "default" : "destructive"}>{env.present ? "Present" : "Missing"}</Badge>
            </div>
          ))}
        </div>

        {allPresent && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Environment Ready:</strong> All required environment variables are properly configured.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Copy, ExternalLink, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnvVar {
  name: string
  description: string
  example: string
  required: boolean
  isSecret?: boolean
}

const ENV_VARIABLES: EnvVar[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Your Supabase project URL",
    example: "https://your-project.supabase.co",
    required: true,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Your Supabase anonymous/public key",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    required: true,
    isSecret: true,
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    description: "Your Supabase service role key (server-side only)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    required: true,
    isSecret: true,
  },
]

export function EnvironmentSetup() {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    // Check which environment variables are present
    const status: Record<string, boolean> = {}
    ENV_VARIABLES.forEach((envVar) => {
      // We can only check public env vars on the client side
      if (envVar.name.startsWith("NEXT_PUBLIC_")) {
        status[envVar.name] = !!(process.env as any)[envVar.name]
      } else {
        // For server-side env vars, we'll assume they need to be set
        status[envVar.name] = false
      }
    })
    setEnvStatus(status)
  }, [])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const toggleSecretVisibility = (envName: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [envName]: !prev[envName],
    }))
  }

  const envTemplate = `# Supabase Configuration
# Get these values from your Supabase project dashboard

# Your Supabase project URL (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Your Supabase anonymous key (Project Settings > API > anon/public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Your Supabase service role key (Project Settings > API > service_role)
# ⚠️ Keep this secret! Never expose in client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
`

  const allEnvVarsSet = ENV_VARIABLES.every((envVar) => envStatus[envVar.name])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <div>
            <CardTitle>Environment Setup Required</CardTitle>
            <CardDescription>Configure your Supabase environment variables to continue</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your Supabase environment variables are missing or incomplete. Please follow the setup instructions below.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Quick Setup Guide</h3>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-2">
              <li>
                Go to your{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900 inline-flex items-center gap-1"
                >
                  Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Select your project (or create a new one)</li>
              <li>Go to Project Settings → API</li>
              <li>Copy the values and add them to your environment variables</li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Environment Variables Status</h3>
            {ENV_VARIABLES.map((envVar) => (
              <div key={envVar.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {envStatus[envVar.name] ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{envVar.name}</code>
                    {envVar.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                    )}
                  </div>
                  {envVar.isSecret && (
                    <Button
                      onClick={() => toggleSecretVisibility(envVar.name)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {showSecrets[envVar.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{envVar.description}</p>
                <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                  {envVar.isSecret && !showSecrets[envVar.name] ? "••••••••••••••••" : envVar.example}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Environment File Template</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
              <Button
                onClick={() => copyToClipboard(envTemplate, "template")}
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied === "template" ? "Copied!" : "Copy"}
              </Button>
              <pre className="text-sm overflow-x-auto pr-20">
                <code>{envTemplate}</code>
              </pre>
            </div>
            <p className="text-sm text-gray-600">
              Create a <code>.env.local</code> file in your project root and paste this template, then fill in your
              actual values.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">🔒 Security Notes</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>
                • Never commit your <code>.env.local</code> file to version control
              </li>
              <li>• The service role key has admin privileges - keep it secret</li>
              <li>
                • Only the <code>NEXT_PUBLIC_*</code> variables are exposed to the browser
              </li>
              <li>• Restart your development server after adding environment variables</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} className="flex-1">
            Check Again
          </Button>
          <Button
            onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            variant="outline"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Supabase Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

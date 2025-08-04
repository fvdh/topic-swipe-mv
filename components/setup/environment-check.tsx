"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, ExternalLink, Copy, Eye, EyeOff } from "lucide-react"

interface EnvironmentVariable {
  name: string
  description: string
  required: boolean
  clientSide: boolean
  present: boolean
  value?: string
}

export function EnvironmentCheck() {
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([])
  const [showValues, setShowValues] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  useEffect(() => {
    // Check environment variables
    const variables: EnvironmentVariable[] = [
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        description: "Your Supabase project URL",
        required: true,
        clientSide: true,
        present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        description: "Your Supabase anonymous/public key",
        required: true,
        clientSide: true,
        present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        description: "Your Supabase service role key (server-side only)",
        required: true,
        clientSide: false,
        present: true, // We can't check server-side vars from client
        value: "Hidden (server-side)",
      },
    ]

    setEnvVars(variables)
  }, [])

  const copyToClipboard = async (varName: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedVar(varName)
      setTimeout(() => setCopiedVar(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const allRequired = envVars.filter((v) => v.required)
  const missingRequired = allRequired.filter((v) => !v.present)
  const isSetupComplete = missingRequired.length === 0

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          {isSetupComplete ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
          <div>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Configure your Supabase connection</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSetupComplete && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Missing Required Environment Variables</h3>
            <p className="text-sm text-red-700 mb-3">
              The following environment variables are required for the app to work:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
              {missingRequired.map((envVar) => (
                <li key={envVar.name}>
                  <code className="bg-red-100 px-1 rounded">{envVar.name}</code> - {envVar.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isSetupComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Environment Variables Configured</h3>
            <p className="text-sm text-green-700">All required environment variables are present.</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions</h3>
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
            <li>Go to Settings → API</li>
            <li>Copy the Project URL and API keys</li>
            <li>
              Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root
            </li>
            <li>Add the environment variables as shown below</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Environment Variables Status</h4>
            <Button
              onClick={() => setShowValues(!showValues)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showValues ? "Hide Values" : "Show Values"}
            </Button>
          </div>

          <div className="space-y-3">
            {envVars.map((envVar) => (
              <div
                key={envVar.name}
                className={`border rounded-lg p-4 ${
                  envVar.present ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {envVar.present ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <code className="font-mono text-sm font-medium">{envVar.name}</code>
                    {envVar.required && <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Required</span>}
                    {envVar.clientSide && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Client-side</span>
                    )}
                  </div>
                  {envVar.present && envVar.value && showValues && envVar.clientSide && (
                    <Button
                      onClick={() => copyToClipboard(envVar.name, envVar.value!)}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedVar === envVar.name ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{envVar.description}</p>
                {showValues && envVar.value && envVar.clientSide && (
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    {envVar.present ? envVar.value : "Not set"}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Example .env.local file:</h4>
          <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
            <code>{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: PostgreSQL direct connection (if using Supabase)
POSTGRES_URL=your-postgres-connection-string
POSTGRES_PRISMA_URL=your-postgres-prisma-connection-string
POSTGRES_URL_NON_POOLING=your-postgres-non-pooling-connection-string
POSTGRES_USER=postgres
POSTGRES_HOST=your-host
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Security Notes</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              • Never commit your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file to version control
            </li>
            <li>• The service role key should only be used server-side</li>
            <li>• Public keys (NEXT_PUBLIC_*) are safe to expose to the client</li>
            <li>• Restart your development server after adding environment variables</li>
          </ul>
        </div>

        {!isSetupComplete && (
          <div className="text-center">
            <Button onClick={() => window.location.reload()} disabled>
              Refresh After Setup
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Add the missing environment variables and restart your dev server
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

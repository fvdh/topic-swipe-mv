"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Copy, ExternalLink, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EnvironmentSetup() {
  const [envVars, setEnvVars] = useState({
    NEXT_PUBLIC_SUPABASE_URL: "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
  })

  const [showKeys, setShowKeys] = useState({
    NEXT_PUBLIC_SUPABASE_ANON_KEY: false,
    SUPABASE_SERVICE_ROLE_KEY: false,
  })

  const [copiedTemplate, setCopiedTemplate] = useState(false)

  // Check current environment variables
  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    })
  }, [])

  const envTemplate = `# Supabase Configuration
# Get these values from your Supabase project dashboard

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-id.supabase.co"}

# Your Supabase anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here"}

# Your Supabase service role key (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=${envVars.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key-here"}
`

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(envTemplate)
      setCopiedTemplate(true)
      setTimeout(() => setCopiedTemplate(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const toggleKeyVisibility = (key: keyof typeof showKeys) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getEnvStatus = () => {
    const hasUrl = !!envVars.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!envVars.SUPABASE_SERVICE_ROLE_KEY

    if (hasUrl && hasAnonKey && hasServiceKey) return "complete"
    if (hasUrl && hasAnonKey) return "partial"
    return "missing"
  }

  const status = getEnvStatus()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          {status === "complete" ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-orange-600" />
          )}
          <div>
            <CardTitle>Environment Setup</CardTitle>
            <CardDescription>Configure your Supabase environment variables</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`text-center p-4 rounded-lg ${status === "complete" ? "bg-green-50" : "bg-orange-50"}`}>
          <p className={`font-medium ${status === "complete" ? "text-green-600" : "text-orange-600"}`}>
            {status === "complete" && "Environment variables configured!"}
            {status === "partial" && "Partial configuration - service role key missing"}
            {status === "missing" && "Environment variables required"}
          </p>
        </div>

        <div className="space-y-6">
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
              <li>Copy your Project URL and API keys</li>
              <li>
                Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root
              </li>
              <li>Add the environment variables below</li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Environment Variables Template</h4>
              <Button
                onClick={copyTemplate}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <Copy className="w-4 h-4" />
                {copiedTemplate ? "Copied!" : "Copy Template"}
              </Button>
            </div>

            <div className="border rounded-lg">
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                <code>{envTemplate}</code>
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Current Configuration</h4>

            <div className="space-y-3">
              <div>
                <Label htmlFor="supabase-url">NEXT_PUBLIC_SUPABASE_URL</Label>
                <Input
                  id="supabase-url"
                  value={envVars.NEXT_PUBLIC_SUPABASE_URL || "Not set"}
                  readOnly
                  className={envVars.NEXT_PUBLIC_SUPABASE_URL ? "text-green-700" : "text-red-600"}
                />
              </div>

              <div>
                <Label htmlFor="anon-key">NEXT_PUBLIC_SUPABASE_ANON_KEY</Label>
                <div className="relative">
                  <Input
                    id="anon-key"
                    type={showKeys.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text" : "password"}
                    value={envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || "Not set"}
                    readOnly
                    className={envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-700" : "text-red-600"}
                  />
                  {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleKeyVisibility("NEXT_PUBLIC_SUPABASE_ANON_KEY")}
                    >
                      {showKeys.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="service-key">SUPABASE_SERVICE_ROLE_KEY</Label>
                <div className="relative">
                  <Input
                    id="service-key"
                    type={showKeys.SUPABASE_SERVICE_ROLE_KEY ? "text" : "password"}
                    value={envVars.SUPABASE_SERVICE_ROLE_KEY || "Not set (optional)"}
                    readOnly
                    className={envVars.SUPABASE_SERVICE_ROLE_KEY ? "text-green-700" : "text-orange-600"}
                  />
                  {envVars.SUPABASE_SERVICE_ROLE_KEY && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleKeyVisibility("SUPABASE_SERVICE_ROLE_KEY")}
                    >
                      {showKeys.SUPABASE_SERVICE_ROLE_KEY ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Service role key is optional but recommended for admin operations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Security Note</h4>
            <p className="text-sm text-yellow-700">
              Never commit your <code>.env.local</code> file to version control. The service role key has admin
              privileges and should be kept secret.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} className="flex-1" disabled={status === "missing"}>
            {status === "missing" ? "Configure Environment First" : "Continue Setup"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

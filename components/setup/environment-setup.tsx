"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ExternalLink, Copy, Eye, EyeOff } from "lucide-react"

export function EnvironmentSetup() {
  const [showKeys, setShowKeys] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyName)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const envVars = [
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
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      description: "Your Supabase service role key (keep secret!)",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      required: true,
      secret: true,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Environment Variables Required
          </CardTitle>
          <CardDescription>
            You need to configure your Supabase environment variables before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> Create a <code>.env.local</code> file in your project root with the
              following variables.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">How to get your Supabase credentials:</h4>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
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
            </ol>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Environment Variables</h4>
              <Button
                onClick={() => setShowKeys(!showKeys)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showKeys ? "Hide" : "Show"} Keys
              </Button>
            </div>

            {envVars.map((envVar) => (
              <div key={envVar.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{envVar.name}</Label>
                    {envVar.required && <span className="text-red-500 text-sm">*</span>}
                    {envVar.secret && <span className="text-orange-500 text-xs">(SECRET)</span>}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(envVar.name, envVar.name)}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedKey === envVar.name ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{envVar.description}</p>
                <Input
                  value={envVar.example}
                  readOnly
                  type={envVar.secret && !showKeys ? "password" : "text"}
                  className="font-mono text-xs"
                  placeholder={`Your ${envVar.name.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Example .env.local file:</h4>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
              <code>
                {`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </code>
            </pre>
            <Button
              onClick={() =>
                copyToClipboard(
                  `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
                  "env-template",
                )
              }
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copiedKey === "env-template" ? "Copied!" : "Copy Template"}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> After creating your <code>.env.local</code> file, restart your development
              server with <code>npm run dev</code> for the changes to take effect.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

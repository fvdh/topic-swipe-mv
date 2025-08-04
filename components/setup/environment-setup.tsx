"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ExternalLink, FileText, Server } from "lucide-react"

export function EnvironmentSetup() {
  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <CardTitle className="text-red-800">Environment Variables Required</CardTitle>
              <CardDescription className="text-red-700">
                Supabase configuration is missing or incomplete
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-3">Quick Setup Guide</h3>
            <ol className="text-sm text-red-700 list-decimal list-inside space-y-2">
              <li>
                Go to{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-900 inline-flex items-center gap-1"
                >
                  Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Create a new project or select an existing one</li>
              <li>Go to Settings → API</li>
              <li>Copy your Project URL and API keys</li>
              <li>
                Create a <code className="bg-red-100 px-1 rounded">.env.local</code> file in your project root
              </li>
              <li>Add the environment variables shown below</li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="bg-white border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-red-600" />
              <h4 className="font-semibold text-red-800">.env.local file content:</h4>
            </div>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
              <code>{`# Required Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Direct PostgreSQL connection
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
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">Where to find your keys:</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • <strong>Project URL:</strong> Settings → API → Project URL
              </li>
              <li>
                • <strong>Anon Key:</strong> Settings → API → Project API keys → anon/public
              </li>
              <li>
                • <strong>Service Role Key:</strong> Settings → API → Project API keys → service_role
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🔒 Security Notes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Never commit your .env.local file to version control</li>
              <li>• The service role key should only be used server-side</li>
              <li>• Public keys (NEXT_PUBLIC_*) are safe to expose to the client</li>
              <li>• Add .env.local to your .gitignore file</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

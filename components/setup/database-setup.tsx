"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Database, ExternalLink, Loader2, RefreshCw, Settings } from "lucide-react"
import { EnvironmentSetup } from "./environment-setup"
import { TopicSync } from "./topic-sync"

interface DatabaseStatus {
  ready: boolean
  error?: string
  details?: string
  envMissing?: boolean
  tables_checked?: string[]
  location_columns?: boolean
  counts?: {
    users: number
    topics: number
  }
}

export function DatabaseSetup() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("environment")

  const checkDatabase = async () => {
    setLoading(true)
    try {
      console.log("Checking database connection...")
      const response = await fetch("/api/test-db")
      const data = await response.json()

      console.log("Database check response:", data)
      setStatus(data)

      // If database is ready, move to topics tab
      if (data.ready) {
        setActiveTab("topics")
      }
    } catch (error) {
      console.error("Database check failed:", error)
      setStatus({
        ready: false,
        error: "Connection failed",
        details: "Unable to connect to the database API",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if we have basic environment variables
    const hasBasicEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (hasBasicEnv) {
      checkDatabase()
    } else {
      setLoading(false)
      setStatus({
        ready: false,
        envMissing: true,
        error: "Environment variables missing",
        details: "Please configure your Supabase environment variables",
      })
    }
  }, [])

  const sqlScripts = [
    {
      name: "Create Tables",
      file: "001-create-tables.sql",
      description: "Creates the basic database structure (users, profiles, topics, etc.)",
    },
    {
      name: "Seed Topics",
      file: "002-seed-topics.sql",
      description: "Adds the default topics for swiping",
    },
    {
      name: "Create Functions",
      file: "003-create-functions.sql",
      description: "Creates database functions for matching and compatibility",
    },
    {
      name: "Add Missing Columns",
      file: "004-add-missing-columns.sql",
      description: "Adds location and preference columns if missing",
    },
    {
      name: "Enhanced Matching",
      file: "006-enhanced-matching.sql",
      description: "Updates matching algorithm for all topic categories",
    },
  ]

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg">Checking database connection...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>Configure your Supabase database and environment</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Environment
            {status?.envMissing && (
              <Badge variant="destructive" className="ml-1 h-5 text-xs">
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
            {status?.ready === false && !status?.envMissing && (
              <Badge variant="destructive" className="ml-1 h-5 text-xs">
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="environment" className="space-y-4">
          {status?.envMissing ? (
            <EnvironmentSetup />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Environment Configured</h3>
                    <p className="text-sm text-green-600">Your Supabase environment variables are set up correctly</p>
                  </div>
                </div>
                <Button onClick={() => setActiveTab("database")} className="w-full">
                  Continue to Database Setup
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Database Status
                    {status?.ready ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </CardTitle>
                  <CardDescription>{status?.ready ? "Database is ready" : "Database setup required"}</CardDescription>
                </div>
                <Button onClick={checkDatabase} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Check Again
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {status?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{status.error}</strong>
                    {status.details && (
                      <>
                        <br />
                        {status.details}
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {!status?.ready && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions</h4>
                    <ol className="text-sm text-blue-700 list-decimal list-inside space-y-2">
                      <li>
                        Open your{" "}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-900 inline-flex items-center gap-1"
                        >
                          Supabase Dashboard <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>Go to the SQL Editor</li>
                      <li>Run the SQL scripts below in order</li>
                      <li>Come back and click "Check Again"</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">SQL Scripts to Run</h4>
                    {sqlScripts.map((script, index) => (
                      <div key={script.file} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{script.name}</span>
                          </div>
                          <Button
                            onClick={() => window.open(`https://github.com/your-repo/scripts/${script.file}`, "_blank")}
                            variant="outline"
                            size="sm"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Script
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{script.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status?.ready && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Database Ready</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Tables checked: {status.tables_checked?.join(", ")}</p>
                      <p>Users: {status.counts?.users || 0}</p>
                      <p>Topics: {status.counts?.topics || 0}</p>
                      <p>Location columns: {status.location_columns ? "Present" : "Missing (optional)"}</p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("topics")} className="w-full">
                    Continue to Topic Setup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <TopicSync />
        </TabsContent>
      </Tabs>
    </div>
  )
}

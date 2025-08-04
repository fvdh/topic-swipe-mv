"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, FolderSyncIcon as Sync, Loader2, Database } from "lucide-react"

interface TopicSyncStatus {
  mockTopics: number
  dbTopics: number
  missingInDb: string[]
  extraInDb: string[]
  needsSync: boolean
}

interface DbTopic {
  id: string
  title: string
  description: string
  category: string
  image_url: string
  icon: string
  is_active: boolean
}

export function TopicSync() {
  const [syncStatus, setSyncStatus] = useState<TopicSyncStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [error, setError] = useState("")
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [extraTopics, setExtraTopics] = useState<DbTopic[]>([])
  const [showExtraTopics, setShowExtraTopics] = useState(false)

  useEffect(() => {
    checkSyncStatus()
  }, [])

  useEffect(() => {
    if (syncStatus?.extraInDb.length) {
      fetchExtraTopics()
    }
  }, [syncStatus])

  const checkSyncStatus = async () => {
    try {
      setIsLoading(true)
      setError("")

      console.log("Checking sync status...")

      const response = await fetch("/api/topics/sync")
      const data = await response.json()

      console.log("Status response:", data)

      if (!response.ok) {
        console.error("Status check failed with status:", response.status)
        throw new Error(data.error || "Failed to check sync status")
      }

      console.log("Status check successful:", data)
      setSyncStatus(data)
    } catch (error: any) {
      console.error("Sync status check error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const syncTopics = async () => {
    try {
      setIsLoading(true)
      setError("")

      console.log("Starting topic sync...")

      const response = await fetch("/api/topics/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Sync response:", data)

      if (!response.ok) {
        console.error("Sync failed with status:", response.status)
        throw new Error(data.error || "Failed to sync topics")
      }

      console.log("Sync successful:", data)
      setLastSyncTime(new Date().toLocaleString())
      await checkSyncStatus() // Refresh status
    } catch (error: any) {
      console.error("Topic sync error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExtraTopics = async () => {
    if (!syncStatus?.extraInDb.length) return

    try {
      const response = await fetch(`/api/topics?ids=${syncStatus.extraInDb.join(",")}`)
      const data = await response.json()
      
      if (response.ok) {
        setExtraTopics(data.topics || [])
      }
    } catch (error) {
      console.error("Failed to fetch extra topics:", error)
    }
  }

  const cleanupExtraTopics = async () => {
    if (!syncStatus?.extraInDb.length) return

    try {
      setIsCleaningUp(true)
      setError("")

      const response = await fetch("/api/topics/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicIds: syncStatus.extraInDb
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to cleanup topics")
      }

      setLastSyncTime(new Date().toLocaleString())
      await checkSyncStatus() // Refresh status
    } catch (error: any) {
      console.error("Topic cleanup error:", error)
      setError(error.message)
    } finally {
      setIsCleaningUp(false)
    }
  }

  const getSyncStatusColor = () => {
    if (!syncStatus) return "text-gray-600"
    return syncStatus.needsSync ? "text-red-600" : "text-green-600"
  }

  const getSyncStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    if (!syncStatus) return <Database className="w-6 h-6 text-gray-600" />
    return syncStatus.needsSync ? (
      <AlertCircle className="w-6 h-6 text-red-600" />
    ) : (
      <CheckCircle className="w-6 h-6 text-green-600" />
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getSyncStatusIcon()}
          <div>
            <CardTitle>Topic Database Sync</CardTitle>
            <CardDescription>Ensure topics are properly synced between frontend and database</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Sync Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {syncStatus && (
          <div className="space-y-4">
            <div className={`text-center p-4 rounded-lg ${syncStatus.needsSync ? "bg-amber-50 border border-amber-200" : "bg-green-50"}`}>
              <p className={`font-medium ${syncStatus.needsSync ? "text-amber-800" : getSyncStatusColor()}`}>
                {syncStatus.needsSync 
                  ? syncStatus.extraInDb.length > 0 
                    ? `Database has ${syncStatus.extraInDb.length} extra topics that don't exist in frontend`
                    : syncStatus.missingInDb.length > 0
                    ? `Frontend has ${syncStatus.missingInDb.length} topics missing from database`
                    : "Topics need to be synced"
                  : "Topics are in sync"
                }
              </p>
              {syncStatus.needsSync && syncStatus.extraInDb.length > 0 && (
                <p className="text-sm text-amber-700 mt-1">
                  You can remove the extra topics or keep them. The sync won't change this.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{syncStatus.mockTopics}</div>
                <div className="text-sm text-blue-700">Frontend Topics</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{syncStatus.dbTopics}</div>
                <div className="text-sm text-purple-700">Database Topics</div>
              </div>
            </div>

            {syncStatus.missingInDb.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Missing in Database ({syncStatus.missingInDb.length})
                </h4>
                <div className="text-sm text-yellow-700">
                  {syncStatus.missingInDb.length > 5
                    ? `${syncStatus.missingInDb.slice(0, 5).join(", ")} and ${syncStatus.missingInDb.length - 5} more...`
                    : syncStatus.missingInDb.join(", ")}
                </div>
              </div>
            )}

            {syncStatus.extraInDb.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-800">Extra in Database ({syncStatus.extraInDb.length})</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowExtraTopics(!showExtraTopics)}
                      className="text-blue-700 border-blue-300"
                    >
                      {showExtraTopics ? "Hide" : "Show"} Topics
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={cleanupExtraTopics}
                      disabled={isCleaningUp}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isCleaningUp ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Cleaning...
                        </>
                      ) : (
                        "Remove Extra"
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-blue-700">
                  {syncStatus.extraInDb.length > 5
                    ? `${syncStatus.extraInDb.slice(0, 5).join(", ")} and ${syncStatus.extraInDb.length - 5} more...`
                    : syncStatus.extraInDb.join(", ")}
                </div>
                
                {showExtraTopics && extraTopics.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {extraTopics.map((topic) => (
                      <div key={topic.id} className="bg-white rounded p-2 border border-blue-200">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{topic.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{topic.title}</div>
                            <div className="text-xs text-gray-600">{topic.category}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {lastSyncTime && <div className="text-center text-sm text-gray-500">Last synced: {lastSyncTime}</div>}

        <div className="flex gap-3">
          <Button onClick={checkSyncStatus} variant="outline" disabled={isLoading} className="flex-1 bg-transparent">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Status"
            )}
          </Button>

          <Button onClick={syncTopics} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Sync className="w-4 h-4 mr-2" />
                Sync Topics
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">What does sync do?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensures all frontend topics (35) exist in the database</li>
            <li>• Updates existing topics with latest frontend data</li>
            <li>• Does NOT remove extra topics from database</li>
            <li>• Fixes foreign key constraint errors when saving preferences</li>
            <li>• Required before users can swipe and save preferences</li>
          </ul>
          <div className="mt-2 p-2 bg-amber-100 rounded text-amber-800 text-xs">
            <strong>Note:</strong> Sync only adds/updates frontend topics. Use "Remove Extra" to clean up database-only topics.
          </div>
        </div>

        {error && error.includes("environment variable") && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">Environment Setup Required</h4>
            <div className="text-sm text-amber-700 space-y-2">
              <p>To use the sync functionality, you need to configure Supabase environment variables:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create a <code className="bg-amber-100 px-1 rounded">.env.local</code> file in your project root</li>
                <li>Add your Supabase project URL and keys</li>
                <li>See <code className="bg-amber-100 px-1 rounded">.env.local.example</code> for the format</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

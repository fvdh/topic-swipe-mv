"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, RefreshCw, Database } from "lucide-react"

interface TopicSyncStatus {
  success: boolean
  message: string
  details?: string
  topics_synced?: number
  categories?: Record<string, number>
}

export function TopicSync() {
  const [syncStatus, setSyncStatus] = useState<TopicSyncStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const syncTopics = async () => {
    setLoading(true)
    setProgress(0)
    setSyncStatus(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/topics/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Topic sync failed")
      }

      setSyncStatus(data)
    } catch (error: any) {
      console.error("Topic sync error:", error)
      setSyncStatus({
        success: false,
        message: "Topic sync failed",
        details: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const checkTopics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/topics")
      const data = await response.json()

      if (response.ok && data.topics) {
        const categories = data.topics.reduce((acc: Record<string, number>, topic: any) => {
          acc[topic.category] = (acc[topic.category] || 0) + 1
          return acc
        }, {})

        setSyncStatus({
          success: true,
          message: "Topics loaded successfully",
          topics_synced: data.topics.length,
          categories,
        })
      } else {
        setSyncStatus({
          success: false,
          message: "Failed to load topics",
          details: data.error || "Unknown error",
        })
      }
    } catch (error: any) {
      setSyncStatus({
        success: false,
        message: "Failed to check topics",
        details: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Topic Synchronization</CardTitle>
              <CardDescription>Sync conversation topics with your database</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">What this does:</h4>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Syncs 35 conversation topics across 5 categories</li>
              <li>Ensures topic IDs match between frontend and database</li>
              <li>Creates topics for: Conversation, Technology, Lifestyle, Health, Nature</li>
              <li>Safe to run multiple times (won't create duplicates)</li>
            </ul>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">{progress < 100 ? "Syncing topics..." : "Finalizing sync..."}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {syncStatus && (
            <Alert variant={syncStatus.success ? "default" : "destructive"}>
              {syncStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                <strong>{syncStatus.message}</strong>
                {syncStatus.details && (
                  <>
                    <br />
                    <span className="text-sm">{syncStatus.details}</span>
                  </>
                )}
                {syncStatus.topics_synced && (
                  <>
                    <br />
                    <span className="text-sm">Topics synced: {syncStatus.topics_synced}</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {syncStatus?.categories && (
            <div className="space-y-3">
              <h4 className="font-semibold">Topics by Category</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(syncStatus.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-2 border rounded">
                    <span className="capitalize text-sm">{category}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={syncTopics} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Sync Topics
                </>
              )}
            </Button>
            <Button onClick={checkTopics} variant="outline" disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

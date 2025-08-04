"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Heart, MessageCircle, Loader2, Globe, Target } from "lucide-react"
import type { CompatibilityResult } from "@/lib/matching"

interface EnhancedMatchListProps {
  userId: string
}

export function EnhancedMatchList({ userId }: EnhancedMatchListProps) {
  const [matches, setMatches] = useState<CompatibilityResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMatches()
  }, [userId])

  const fetchMatches = async () => {
    try {
      setIsLoading(true)
      setError("")

      console.log("Fetching enhanced matches for user:", userId)

      const response = await fetch(`/api/matches?userId=${userId}&maxDistance=50&minCompatibility=40&limit=20`)
      const data = await response.json()

      console.log("Enhanced matches API response:", { ok: response.ok, status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch matches")
      }

      setMatches(data.matches || [])
    } catch (error: any) {
      console.error("Fetch enhanced matches error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      conversation: "💭",
      lifestyle: "🏠",
      health: "❤️",
      technology: "💻",
      nature: "🌿",
    }
    return icons[category as keyof typeof icons] || "📝"
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      conversation: "bg-purple-100 text-purple-800",
      lifestyle: "bg-orange-100 text-orange-800",
      health: "bg-pink-100 text-pink-800",
      technology: "bg-blue-100 text-blue-800",
      nature: "bg-green-100 text-green-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Finding your enhanced matches...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Matches</h3>
        <div className="bg-red-50 p-4 rounded-lg mb-4">
          <p className="text-red-800 font-medium mb-2">Error Details:</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>

        <div className="space-y-2">
          <Button onClick={fetchMatches} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Building your enhanced matches</h3>
        <p className="text-gray-600 mb-4">
          Complete more topics across different categories to find people with similar interests!
        </p>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Enhanced Matching Tips:</h4>
          <ul className="space-y-1 text-sm text-blue-700 text-left">
            <li>• Complete topics from all 5 categories for best results</li>
            <li>• Conversation starters have the highest matching weight</li>
            <li>• Category diversity increases your compatibility scores</li>
            <li>• Distance preferences must be mutual for matches</li>
          </ul>
        </div>
        <Button onClick={fetchMatches} variant="outline">
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Enhanced Matches</h2>
        <Button onClick={fetchMatches} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Found {matches.length} compatible {matches.length === 1 ? "person" : "people"} using our enhanced algorithm that
        considers all topic categories
      </div>

      {matches.map((match) => (
        <Card key={match.user_id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {match.profile.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{match.profile.name}</h3>
                  {match.profile.age && <p className="text-gray-600">{match.profile.age} years old</p>}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    {match.profile.distance_km ? (
                      <>
                        <MapPin className="w-4 h-4" />
                        {match.profile.city && `${match.profile.city} • `}
                        {Math.round(match.profile.distance_km)}km away
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        Worldwide connection
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{match.compatibility_score}%</div>
                <div className="text-sm text-gray-500">Compatible</div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Target className="w-3 h-3" />
                  Enhanced
                </div>
              </div>
            </div>

            {match.profile.bio && <p className="text-gray-700 mb-4">{match.profile.bio}</p>}

            {/* Category Breakdown */}
            {match.category_breakdown && Object.keys(match.category_breakdown).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Shared interests by category:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(match.category_breakdown).map(([category, count]) => (
                    <Badge key={category} variant="secondary" className={getCategoryColor(category)}>
                      {getCategoryIcon(category)} {category} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>{match.matched_topics} shared interests</span>
              <span>{match.shared_topics} total topics compared</span>
              <span>{Object.keys(match.category_breakdown || {}).length} categories matched</span>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-transparent" variant="outline">
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
              <Button className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

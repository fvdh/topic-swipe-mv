"use client"

import type { SwipeResult } from "../types/topic"
import { calculateCompatibility, getCompatibilityLevel } from "../utils/compatibility"
import { mockUsers } from "../data/mock-users"
import { ArrowLeft, Users, Heart, X, TrendingUp } from "lucide-react"

interface CompatibilityAnalysisProps {
  userResults: SwipeResult[]
  onBack: () => void
}

export function CompatibilityAnalysis({ userResults, onBack }: CompatibilityAnalysisProps) {
  // Filter to only conversation starters
  const conversationResults = userResults.filter((result) => result.topic.category.toLowerCase() === "conversation")

  if (conversationResults.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white shadow-sm p-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Compatibility Analysis</h1>
          </div>
        </div>

        <div className="p-4 text-center">
          <div className="text-6xl mb-4">💭</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Conversation Starters Yet</h2>
          <p className="text-gray-600">Try some conversation starter topics to see your compatibility with others!</p>
        </div>
      </div>
    )
  }

  // Calculate compatibility with mock users
  const compatibilityScores = mockUsers
    .map((user) => {
      const score = calculateCompatibility(conversationResults, user.preferences)
      return {
        ...score,
        userId: user.id,
        userName: user.name,
      }
    })
    .sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compatibility Analysis</h1>
            <p className="text-sm text-gray-500">Based on {conversationResults.length} conversation preferences</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Your Preferences Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Your Conversation Style
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {conversationResults.filter((r) => r.direction === "right").length}
              </div>
              <div className="text-sm text-green-700">Topics You Love</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {conversationResults.filter((r) => r.direction === "left").length}
              </div>
              <div className="text-sm text-red-700">Topics You Pass</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">Your preferences help us find people you'll click with!</div>
        </div>

        {/* Compatibility Matches */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Your Potential Matches
          </h2>

          {compatibilityScores.map((match, index) => {
            const compatibility = getCompatibilityLevel(match.score)

            return (
              <div key={match.userId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {match.userName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{match.userName}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{compatibility.emoji}</span>
                          <span className={`font-medium ${compatibility.color}`}>{compatibility.level}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{match.score}%</div>
                      <div className="text-sm text-gray-500">Compatible</div>
                    </div>
                  </div>

                  {/* Compatibility Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        match.score >= 70
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : match.score >= 55
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                            : match.score >= 40
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                              : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                      style={{ width: `${match.score}%` }}
                    />
                  </div>

                  <p className="text-gray-600 mb-4">{compatibility.description}</p>

                  {/* Shared Interests */}
                  {match.matchedTopics.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-500" />
                        You Both Agree On ({match.matchedTopics.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.matchedTopics.slice(0, 3).map((topic) => (
                          <span key={topic.id} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {topic.icon} {topic.title}
                          </span>
                        ))}
                        {match.matchedTopics.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            +{match.matchedTopics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conflicting Views */}
                  {match.conflictingTopics.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        Different Perspectives ({match.conflictingTopics.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.conflictingTopics.slice(0, 2).map((topic) => (
                          <span key={topic.id} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                            {topic.icon} {topic.title}
                          </span>
                        ))}
                        {match.conflictingTopics.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            +{match.conflictingTopics.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Compatibility Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • <strong>High compatibility (70%+):</strong> Great conversation flow expected!
            </li>
            <li>
              • <strong>Moderate compatibility (40-70%):</strong> Different views can spark interesting discussions.
            </li>
            <li>
              • <strong>Low compatibility (&lt;40%):</strong> Opposites can attract - focus on learning from each other!
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

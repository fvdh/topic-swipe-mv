"use client"

import type { SwipeResult } from "../types/topic"
import { ThumbsUp, ThumbsDown, ArrowLeft, Users } from "lucide-react"

interface OverviewProps {
  results: SwipeResult[]
  onBack: () => void
  onShowCompatibility?: () => void
}

export function Overview({ results, onBack, onShowCompatibility }: OverviewProps) {
  const agreedItems = results.filter((result) => result.direction === "right")
  const disagreedItems = results.filter((result) => result.direction === "left")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Your Responses</h1>
          </div>

          {onShowCompatibility && results.some((r) => r.topic.category.toLowerCase() === "conversation") && (
            <button
              onClick={onShowCompatibility}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Compatibility
            </button>
          )}
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-100 rounded-xl p-6 text-center">
            <ThumbsUp className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-800">{agreedItems.length}</div>
            <div className="text-green-700 font-medium">Agreed</div>
          </div>
          <div className="bg-red-100 rounded-xl p-6 text-center">
            <ThumbsDown className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-800">{disagreedItems.length}</div>
            <div className="text-red-700 font-medium">Disagreed</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Agreed Items */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ThumbsUp className="w-6 h-6 text-green-600" />
              {agreedItems.some((item) => item.topic.category.toLowerCase() === "conversation")
                ? "Conversation Starters You Loved"
                : "Topics You Agreed With"}
            </h2>
            <div className="grid gap-4">
              {agreedItems.length === 0 ? (
                <p className="text-gray-500 italic">
                  {results.some((r) => r.topic.category.toLowerCase() === "conversation")
                    ? "No conversation starters loved yet."
                    : "No items agreed with yet."}
                </p>
              ) : (
                agreedItems.map((result) => (
                  <div
                    key={result.topic.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border-l-4 border-green-500"
                  >
                    <div className="flex">
                      <img
                        src={result.topic.image || "/placeholder.svg"}
                        alt={result.topic.title}
                        className="w-24 h-24 object-cover"
                      />
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {result.topic.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{result.topic.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{result.topic.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Disagreed Items */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ThumbsDown className="w-6 h-6 text-red-600" />
              {disagreedItems.some((item) => item.topic.category.toLowerCase() === "conversation")
                ? "Conversation Starters You Passed"
                : "Topics You Disagreed With"}
            </h2>
            <div className="grid gap-4">
              {disagreedItems.length === 0 ? (
                <p className="text-gray-500 italic">
                  {results.some((r) => r.topic.category.toLowerCase() === "conversation")
                    ? "No conversation starters passed yet."
                    : "No items disagreed with yet."}
                </p>
              ) : (
                disagreedItems.map((result) => (
                  <div
                    key={result.topic.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border-l-4 border-red-500"
                  >
                    <div className="flex">
                      <img
                        src={result.topic.image || "/placeholder.svg"}
                        alt={result.topic.title}
                        className="w-24 h-24 object-cover"
                      />
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            {result.topic.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{result.topic.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{result.topic.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

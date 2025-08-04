"use client"

import { useState, useEffect } from "react"
import { TopicCard } from "./components/topic-card"
import { ActionButtons } from "./components/action-buttons"
import { ProgressBar } from "./components/progress-bar"
import { Overview } from "./components/overview"
import { mockTopics, topicCategories } from "./data/topics"
import type { Topic, SwipeResult } from "./types/topic"
import { BarChart3, RotateCcw, ArrowLeft, Users, LogOut, Loader2 } from "lucide-react"
import { CategorySelector } from "./components/category-selector"
import { CompatibilityAnalysis } from "./components/compatibility-analysis"
import { SignUpForm } from "./components/auth/signup-form"
import { SignInForm } from "./components/auth/signin-form"
import { EnhancedLocationPermission } from "./components/location/enhanced-location-permission"
import { MatchList } from "./components/matches/match-list"
import { DatabaseSetup } from "./components/setup/database-setup"

interface User {
  id: string
  email: string
}

interface UserProfile {
  id: string
  user_id: string
  name: string
  bio?: string
  age?: number
}

export default function TopicSwipeApp() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showAuth, setShowAuth] = useState("signin") // "signin" | "signup"
  const [showLocationPermission, setShowLocationPermission] = useState(false)
  const [topics, setTopics] = useState<Topic[]>(mockTopics)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipeResults, setSwipeResults] = useState<SwipeResult[]>([])
  const [showOverview, setShowOverview] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCategorySelector, setShowCategorySelector] = useState(true)
  const [showCompatibility, setShowCompatibility] = useState(false)
  const [showMatches, setShowMatches] = useState(false)
  const [databaseReady, setDatabaseReady] = useState<boolean | null>(null)
  const [topicsReady, setTopicsReady] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user is already logged in (you might want to use localStorage or cookies)
    const savedUser = localStorage.getItem("user")
    const savedProfile = localStorage.getItem("profile")

    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser))
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  useEffect(() => {
    // Test database connection and topic sync on app load
    const testDatabase = async () => {
      try {
        // First check if environment variables are present
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setDatabaseReady(false)
          setTopicsReady(false)
          return
        }

        const dbResponse = await fetch("/api/test-db")
        const dbReady = dbResponse.ok
        setDatabaseReady(dbReady)

        if (dbReady) {
          // Also check if topics are synced
          const topicResponse = await fetch("/api/topics/sync")
          const topicData = await topicResponse.json()
          setTopicsReady(topicResponse.ok && !topicData.needsSync)
        }
      } catch (error) {
        console.error("Database test error:", error)
        setDatabaseReady(false)
        setTopicsReady(false)
      }
    }

    testDatabase()
  }, [])

  const handleAuthSuccess = (userData: User, profileData: UserProfile) => {
    setUser(userData)
    setProfile(profileData)
    setShowLocationPermission(true)

    // Save to localStorage (in production, use secure storage)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("profile", JSON.stringify(profileData))
  }

  const handleLocationSet = () => {
    setShowLocationPermission(false)
  }

  const handleLogout = () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    resetApp()
  }

  const handleSwipe = async (direction: "left" | "right") => {
    if (isAnimating || currentIndex >= topics.length || !user) return

    const currentTopic = topics[currentIndex]
    const newResult: SwipeResult = {
      topic: currentTopic,
      direction,
      timestamp: new Date(),
    }

    setSwipeResults((prev) => [...prev, newResult])
    setIsAnimating(true)

    // Save preference to backend (now includes ALL categories)
    try {
      console.log(
        "Saving preference for topic:",
        currentTopic.id,
        "category:",
        currentTopic.category,
        "direction:",
        direction,
      )

      await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          preferences: [
            {
              topic_id: currentTopic.id,
              preference: direction === "right" ? "like" : "dislike",
            },
          ],
        }),
      })
    } catch (error) {
      console.error("Failed to save preference:", error)
    }

    // Simulate swipe animation delay
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  const handleDisagree = () => handleSwipe("left")
  const handleAgree = () => handleSwipe("right")

  const resetApp = () => {
    setCurrentIndex(0)
    setSwipeResults([])
    setShowOverview(false)
    setShowCompatibility(false)
    setShowMatches(false)
    setShowCategorySelector(true)
    setSelectedCategory("all")
    setTopics([...mockTopics])
  }

  const getTopicCounts = () => {
    const counts: Record<string, number> = { all: mockTopics.length }
    topicCategories.forEach((category) => {
      if (category.id !== "all") {
        counts[category.id] = mockTopics.filter((topic) => topic.category.toLowerCase() === category.id).length
      }
    })
    return counts
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentIndex(0)
    setSwipeResults([])
    setShowCategorySelector(false)
    const filteredTopics =
      categoryId === "all" ? mockTopics : mockTopics.filter((topic) => topic.category.toLowerCase() === categoryId)
    setTopics(filteredTopics)
  }

  const handleBackToCategories = () => {
    setShowCategorySelector(true)
    setCurrentIndex(0)
    setSwipeResults([])
  }

  if (databaseReady === false || topicsReady === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <DatabaseSetup />
      </div>
    )
  }

  if (databaseReady === null || topicsReady === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {databaseReady === null ? "Checking database connection..." : "Verifying topics..."}
          </p>
        </div>
      </div>
    )
  }

  // Show authentication if user is not logged in
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        {showAuth === "signin" ? (
          <SignInForm onSuccess={handleAuthSuccess} onSwitchToSignUp={() => setShowAuth("signup")} />
        ) : (
          <SignUpForm onSuccess={handleAuthSuccess} onSwitchToSignIn={() => setShowAuth("signin")} />
        )}
      </div>
    )
  }

  // Show enhanced location permission screen
  if (showLocationPermission) {
    return <EnhancedLocationPermission userId={user.id} onLocationSet={handleLocationSet} />
  }

  const remainingTopics = topics.length - currentIndex
  const currentTopic = topics[currentIndex]
  const nextTopic = topics[currentIndex + 1]

  if (showMatches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowMatches(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <MatchList userId={user.id} />
        </div>
      </div>
    )
  }

  if (showCategorySelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {profile.name[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{profile.name}</div>
              <div className="text-sm text-gray-500">Welcome back!</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMatches(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Users className="w-6 h-6 text-gray-600" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            topicCounts={getTopicCounts()}
          />

          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 Enhanced Matching</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • <strong>All categories matter:</strong> Your preferences across nature, tech, lifestyle, health, and
                  conversation topics influence matches
                </li>
                <li>
                  • <strong>Smart weighting:</strong> Conversation starters have the highest impact on compatibility
                </li>
                <li>
                  • <strong>Category diversity bonus:</strong> Matching across multiple categories increases
                  compatibility scores
                </li>
                <li>
                  • <strong>Distance preferences:</strong> Only see people within your preferred matching distance
                </li>
              </ul>
            </div>
            <p className="text-gray-600 mb-4">
              Select a theme to start swiping. Every topic you rate helps us find your perfect matches!
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (showOverview) {
    return (
      <Overview
        results={swipeResults}
        onBack={() => setShowOverview(false)}
        onShowCompatibility={() => {
          setShowOverview(false)
          setShowCompatibility(true)
        }}
      />
    )
  }

  if (showCompatibility) {
    return <CompatibilityAnalysis userResults={swipeResults} onBack={() => setShowCompatibility(false)} />
  }

  if (currentIndex >= topics.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">All topics completed!</h2>
          <p className="text-gray-600 mb-8">
            Great job! Your preferences across all categories have been saved and we're finding your perfect matches
            using our enhanced algorithm.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setShowMatches(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Find Enhanced Matches
            </button>

            <button
              onClick={() => setShowOverview(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Your Responses
            </button>

            <button
              onClick={resetApp}
              className="w-full px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Different Topics
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <button onClick={handleBackToCategories} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Topic Swipe
          </h1>
          <p className="text-sm text-gray-500">
            {topicCategories.find((cat) => cat.id === selectedCategory)?.name || "All Topics"}
          </p>
        </div>

        <button
          onClick={() => setShowOverview(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={swipeResults.length === 0}
        >
          <BarChart3 className={`w-6 h-6 ${swipeResults.length === 0 ? "text-gray-300" : "text-gray-600"}`} />
        </button>
      </div>

      <div className="p-4">
        {/* Progress Bar */}
        <ProgressBar current={remainingTopics} total={topics.length} />

        <div className="text-center mb-4">
          <span className="text-gray-600 font-medium">
            {remainingTopics} topic{remainingTopics !== 1 ? "s" : ""} remaining
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Category: {currentTopic?.category} • All categories influence your matches
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          {selectedCategory === "conversation" ? (
            <p className="text-gray-500 text-sm">Swipe right if you love it • Swipe left if it's not for you</p>
          ) : (
            <p className="text-gray-500 text-sm">Swipe right to agree • Swipe left to disagree</p>
          )}
        </div>

        {/* Card Stack */}
        <div className="relative mx-auto max-w-lg h-[750px] mb-8">
          {nextTopic && (
            <TopicCard
              key={nextTopic.id}
              topic={nextTopic}
              onSwipeLeft={handleDisagree}
              onSwipeRight={handleAgree}
              isTop={false}
            />
          )}

          {currentTopic && (
            <TopicCard
              key={currentTopic.id}
              topic={currentTopic}
              onSwipeLeft={handleDisagree}
              onSwipeRight={handleAgree}
              isTop={true}
            />
          )}
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onDisagree={handleDisagree}
          onAgree={handleAgree}
          isConversationMode={selectedCategory === "conversation"}
        />
      </div>
    </div>
  )
}

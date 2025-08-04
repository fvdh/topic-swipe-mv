"use client"

import { useState } from "react"
import { ProfileCard } from "./components/profile-card"
import { ActionButtons } from "./components/action-buttons"
import { ProgressBar } from "./components/progress-bar"
import { mockProfiles } from "./data/profiles"
import type { Profile } from "./types/profile"

export default function TinderApp() {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating || currentIndex >= profiles.length) return

    setIsAnimating(true)

    // Simulate swipe animation delay
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  const handlePass = () => handleSwipe("left")
  const handleLike = () => handleSwipe("right")

  const remainingProfiles = profiles.length - currentIndex
  const currentProfile = profiles[currentIndex]
  const nextProfile = profiles[currentIndex + 1]

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">No more profiles!</h2>
          <p className="text-gray-600 mb-6">Check back later for more potential matches.</p>
          <button
            onClick={() => {
              setCurrentIndex(0)
              setProfiles([...mockProfiles])
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="w-8 h-8" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
          Tinder
        </h1>
        <div className="w-8 h-8" />
      </div>

      <div className="p-4">
        {/* Progress Bar */}
        <ProgressBar current={remainingProfiles} total={profiles.length} />

        <div className="text-center mb-4">
          <span className="text-gray-600 font-medium">{remainingProfiles} profiles remaining</span>
        </div>

        {/* Card Stack */}
        <div className="relative mx-auto max-w-sm h-[600px] mb-8">
          {nextProfile && (
            <ProfileCard
              key={nextProfile.id}
              profile={nextProfile}
              onSwipeLeft={handlePass}
              onSwipeRight={handleLike}
              isTop={false}
            />
          )}

          {currentProfile && (
            <ProfileCard
              key={currentProfile.id}
              profile={currentProfile}
              onSwipeLeft={handlePass}
              onSwipeRight={handleLike}
              isTop={true}
            />
          )}
        </div>

        {/* Action Buttons */}
        <ActionButtons onPass={handlePass} onLike={handleLike} />
      </div>
    </div>
  )
}

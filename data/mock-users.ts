import type { UserProfile, SwipeResult } from "../types/topic"
import { mockTopics } from "./topics"

// Generate mock user preferences
function generateMockPreferences(userId: string, preferencePattern: "similar" | "opposite" | "mixed"): SwipeResult[] {
  const conversationTopics = mockTopics.filter((t) => t.category.toLowerCase() === "conversation")
  const results: SwipeResult[] = []

  conversationTopics.forEach((topic, index) => {
    let direction: "left" | "right"

    switch (preferencePattern) {
      case "similar":
        // 80% chance to agree with popular opinions
        direction = Math.random() > 0.2 ? "right" : "left"
        break
      case "opposite":
        // 80% chance to disagree with popular opinions
        direction = Math.random() > 0.2 ? "left" : "right"
        break
      case "mixed":
        // 50/50 random
        direction = Math.random() > 0.5 ? "right" : "left"
        break
    }

    results.push({
      topic,
      direction,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
    })
  })

  return results
}

export const mockUsers: UserProfile[] = [
  {
    id: "user1",
    name: "Alex",
    preferences: generateMockPreferences("user1", "similar"),
  },
  {
    id: "user2",
    name: "Sam",
    preferences: generateMockPreferences("user2", "mixed"),
  },
  {
    id: "user3",
    name: "Jordan",
    preferences: generateMockPreferences("user3", "opposite"),
  },
  {
    id: "user4",
    name: "Casey",
    preferences: generateMockPreferences("user4", "similar"),
  },
  {
    id: "user5",
    name: "Riley",
    preferences: generateMockPreferences("user5", "mixed"),
  },
]

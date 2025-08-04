export interface Topic {
  id: string // Changed from number to string for UUID compatibility
  title: string
  description: string
  category: string
  image: string
  icon?: string
}

export interface SwipeResult {
  topic: Topic
  direction: "left" | "right"
  timestamp: Date
}

export interface UserProfile {
  id: string
  name: string
  preferences: SwipeResult[]
}

export interface CompatibilityScore {
  userId: string
  userName: string
  score: number
  matchedTopics: Topic[]
  conflictingTopics: Topic[]
  totalSharedTopics: number
}

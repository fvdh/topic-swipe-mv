import type { SwipeResult, CompatibilityScore, Topic } from "../types/topic"

export function calculateCompatibility(
  userPreferences: SwipeResult[],
  otherUserPreferences: SwipeResult[],
): CompatibilityScore {
  const userLikes = new Set(userPreferences.filter((p) => p.direction === "right").map((p) => p.topic.id))
  const userDislikes = new Set(userPreferences.filter((p) => p.direction === "left").map((p) => p.topic.id))

  const otherLikes = new Set(otherUserPreferences.filter((p) => p.direction === "right").map((p) => p.topic.id))
  const otherDislikes = new Set(otherUserPreferences.filter((p) => p.direction === "left").map((p) => p.topic.id))

  // Find matching preferences (both liked or both disliked)
  const bothLiked = Array.from(userLikes).filter((id) => otherLikes.has(id))
  const bothDisliked = Array.from(userDislikes).filter((id) => otherDislikes.has(id))

  // Find conflicting preferences (one liked, other disliked)
  const userLikedOtherDisliked = Array.from(userLikes).filter((id) => otherDislikes.has(id))
  const otherLikedUserDisliked = Array.from(otherLikes).filter((id) => userDislikes.has(id))

  const totalMatches = bothLiked.length + bothDisliked.length
  const totalConflicts = userLikedOtherDisliked.length + otherLikedUserDisliked.length
  const totalSharedTopics = totalMatches + totalConflicts

  // Calculate compatibility score with category weighting (0-100)
  let score = 0
  if (totalSharedTopics > 0) {
    // Base score from matches vs conflicts
    const matchRatio = totalMatches / totalSharedTopics
    score = matchRatio * 100

    // Category-based bonuses
    const categoryBonuses = calculateCategoryBonuses(userPreferences, otherUserPreferences, bothLiked, bothDisliked)
    score += categoryBonuses

    // Bonus for having many shared opinions
    const sharedTopicsBonus = Math.min(totalSharedTopics * 2, 20)
    score += sharedTopicsBonus

    // Extra bonus for mutual likes (stronger than mutual dislikes)
    const mutualLikesBonus = bothLiked.length * 3
    score += mutualLikesBonus

    // Cap at 100
    score = Math.min(score, 100)
  }

  // Get topic objects for matched and conflicting topics
  const allTopics = [...userPreferences, ...otherUserPreferences].map((p) => p.topic)
  const topicMap = new Map(allTopics.map((t) => [t.id, t]))

  const matchedTopics = [...bothLiked, ...bothDisliked]
    .map((id) => topicMap.get(id))
    .filter((topic): topic is Topic => topic !== undefined)

  const conflictingTopics = [...userLikedOtherDisliked, ...otherLikedUserDisliked]
    .map((id) => topicMap.get(id))
    .filter((topic): topic is Topic => topic !== undefined)

  return {
    userId: "other-user",
    userName: "Other User",
    score: Math.round(score),
    matchedTopics,
    conflictingTopics,
    totalSharedTopics,
  }
}

function calculateCategoryBonuses(
  userPreferences: SwipeResult[],
  otherUserPreferences: SwipeResult[],
  bothLiked: string[],
  bothDisliked: string[],
): number {
  // Create topic maps for quick category lookup
  const userTopicMap = new Map(userPreferences.map((p) => [p.topic.id, p.topic]))
  const otherTopicMap = new Map(otherUserPreferences.map((p) => [p.topic.id, p.topic]))

  // Category weights - conversation starters get highest weight
  const categoryWeights = {
    conversation: 1.5,
    lifestyle: 1.2,
    health: 1.1,
    technology: 1.0,
    nature: 1.0,
  }

  let categoryBonus = 0

  // Calculate bonuses for matched topics by category
  const matchedTopicIds = [...bothLiked, ...bothDisliked]
  const categoryMatches: Record<string, number> = {}

  matchedTopicIds.forEach((topicId) => {
    const topic = userTopicMap.get(topicId) || otherTopicMap.get(topicId)
    if (topic) {
      const category = topic.category.toLowerCase()
      categoryMatches[category] = (categoryMatches[category] || 0) + 1
    }
  })

  // Apply category bonuses
  Object.entries(categoryMatches).forEach(([category, count]) => {
    const weight = categoryWeights[category as keyof typeof categoryWeights] || 1.0
    categoryBonus += count * weight * 2 // Base bonus of 2 points per match, multiplied by weight
  })

  // Bonus for having matches across multiple categories (diversity bonus)
  const categoriesWithMatches = Object.keys(categoryMatches).length
  if (categoriesWithMatches >= 3) {
    categoryBonus += 10 // Diversity bonus
  } else if (categoriesWithMatches >= 2) {
    categoryBonus += 5
  }

  return Math.min(categoryBonus, 25) // Cap category bonus at 25 points
}

export function getCompatibilityLevel(score: number): {
  level: string
  color: string
  description: string
  emoji: string
} {
  if (score >= 85) {
    return {
      level: "Perfect Match",
      color: "text-pink-600",
      description: "You two are practically soulmates!",
      emoji: "💕",
    }
  } else if (score >= 70) {
    return {
      level: "Great Match",
      color: "text-green-600",
      description: "You have a lot in common!",
      emoji: "💚",
    }
  } else if (score >= 55) {
    return {
      level: "Good Match",
      color: "text-blue-600",
      description: "Some shared interests with room to explore differences.",
      emoji: "💙",
    }
  } else if (score >= 40) {
    return {
      level: "Moderate Match",
      color: "text-yellow-600",
      description: "Different perspectives could lead to interesting conversations.",
      emoji: "💛",
    }
  } else {
    return {
      level: "Different Vibes",
      color: "text-gray-600",
      description: "Opposites sometimes attract!",
      emoji: "🤔",
    }
  }
}

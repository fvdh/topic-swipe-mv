"use client"

import { EnhancedMatchList } from "./enhanced-match-list"

interface MatchListProps {
  userId: string
}

export function MatchList({ userId }: MatchListProps) {
  return <EnhancedMatchList userId={userId} />
}

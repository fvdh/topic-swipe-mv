"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"

interface UseSwipeProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 100 }: UseSwipeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
    startPos.current = { x: clientX, y: clientY }
    currentPos.current = { x: clientX, y: clientY }
  }, [])

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return

      currentPos.current = { x: clientX, y: clientY }
      const deltaX = clientX - startPos.current.x
      const deltaY = clientY - startPos.current.y

      setDragOffset({ x: deltaX, y: deltaY })
    },
    [isDragging],
  )

  const handleEnd = useCallback(() => {
    if (!isDragging) return

    const deltaX = currentPos.current.x - startPos.current.x

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight()
      } else {
        onSwipeLeft()
      }
    }

    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }, [isDragging, threshold, onSwipeLeft, onSwipeRight])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX, e.clientY)
    },
    [handleStart],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    },
    [handleMove],
  )

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    },
    [handleStart],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    },
    [handleMove],
  )

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  return {
    isDragging,
    dragOffset,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

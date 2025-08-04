import type { Topic } from "../types/topic"
import { useSwipe } from "../hooks/use-swipe"

interface TopicCardProps {
  topic: Topic
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop?: boolean
}

export function TopicCard({ topic, onSwipeLeft, onSwipeRight, isTop = false }: TopicCardProps) {
  const { isDragging, dragOffset, handlers } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    threshold: 100,
  })

  const rotation = dragOffset.x * 0.1
  const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300)
  const isConversationStarter = topic.category.toLowerCase() === "conversation"

  return (
    <div
      className={`absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab select-none border border-gray-100 ${
        isDragging ? "cursor-grabbing" : ""
      } ${isTop ? "z-20" : "z-10"}`}
      style={{
        transform: isTop
          ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.1}px) rotate(${rotation}deg)`
          : "scale(0.95)",
        opacity: isTop ? opacity : 1,
        transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
      }}
      {...handlers}
    >
      <div className="relative h-full">
        {/* Main image */}
        <img
          src={topic.image || "/placeholder.svg"}
          alt={topic.title}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100" />

        {/* Swipe indicators */}
        {isDragging && (
          <>
            <div
              className={`absolute top-8 left-8 px-4 py-2 rounded-lg font-bold text-xl border-4 transition-opacity ${
                dragOffset.x > 50
                  ? "bg-green-500 text-white border-green-400 opacity-100"
                  : "bg-green-500/20 text-green-400 border-green-400 opacity-50"
              }`}
            >
              {isConversationStarter ? "LOVE IT" : "AGREE"}
            </div>
            <div
              className={`absolute top-8 right-8 px-4 py-2 rounded-lg font-bold text-xl border-4 transition-opacity ${
                dragOffset.x < -50
                  ? "bg-red-500 text-white border-red-400 opacity-100"
                  : "bg-red-500/20 text-red-400 border-red-400 opacity-50"
              }`}
            >
              {isConversationStarter ? "NOT FOR ME" : "DISAGREE"}
            </div>
          </>
        )}

        {/* Category badge */}
        <div className="absolute top-6 left-6">
          <span
            className={`inline-block px-3 py-1 backdrop-blur-sm text-sm font-medium rounded-full shadow-sm ${
              isConversationStarter ? "bg-purple-500/90 text-white" : "bg-white/90 text-gray-800"
            }`}
          >
            {isConversationStarter ? "💭 Chat Starter" : topic.category}
          </span>
        </div>

        {/* Content area */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-lg mb-3">{topic.title}</h2>

          {/* Description for conversation starters */}
          {isConversationStarter && (
            <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">{topic.description}</p>
          )}
        </div>

        {/* Icon overlay if available */}
        {topic.icon && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20">
            {topic.icon}
          </div>
        )}

        {/* Special indicator for conversation starters */}
        {isConversationStarter && <div className="absolute top-1/3 right-6 text-6xl opacity-30 animate-pulse">💬</div>}
      </div>
    </div>
  )
}

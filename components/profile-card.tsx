import type { Profile } from "../types/profile"
import { useSwipe } from "../hooks/use-swipe"

interface ProfileCardProps {
  profile: Profile
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop?: boolean
}

export function ProfileCard({ profile, onSwipeLeft, onSwipeRight, isTop = false }: ProfileCardProps) {
  const { isDragging, dragOffset, handlers } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    threshold: 100,
  })

  const rotation = dragOffset.x * 0.1
  const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300)

  return (
    <div
      className={`absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab select-none ${
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
        <img
          src={profile.images[0] || "/placeholder.svg"}
          alt={profile.name}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Swipe indicators */}
        {isDragging && (
          <>
            <div
              className={`absolute top-20 left-8 px-4 py-2 rounded-lg font-bold text-2xl border-4 transition-opacity ${
                dragOffset.x > 50
                  ? "bg-green-500 text-white border-green-400 opacity-100"
                  : "bg-green-500/20 text-green-400 border-green-400 opacity-50"
              }`}
            >
              LIKE
            </div>
            <div
              className={`absolute top-20 right-8 px-4 py-2 rounded-lg font-bold text-2xl border-4 transition-opacity ${
                dragOffset.x < -50
                  ? "bg-red-500 text-white border-red-400 opacity-100"
                  : "bg-red-500/20 text-red-400 border-red-400 opacity-50"
              }`}
            >
              NOPE
            </div>
          </>
        )}

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">
            {profile.name}, {profile.age}
          </h2>
          <p className="text-lg opacity-90 mb-2">{profile.distance} km away</p>
          <p className="text-base opacity-80 line-clamp-3">{profile.bio}</p>
        </div>
      </div>
    </div>
  )
}

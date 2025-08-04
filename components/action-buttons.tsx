"use client"

import { ThumbsDown, ThumbsUp, Heart, X } from "lucide-react"

interface ActionButtonsProps {
  onDisagree: () => void
  onAgree: () => void
  isConversationMode?: boolean
}

export function ActionButtons({ onDisagree, onAgree, isConversationMode = false }: ActionButtonsProps) {
  return (
    <div className="flex justify-center items-center gap-8 mt-8">
      <button
        onClick={onDisagree}
        className="bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 active:scale-95 w-20 h-20"
        title={isConversationMode ? "Not for me" : "Disagree"}
      >
        {isConversationMode ? <X className="w-8 h-8 text-red-500" /> : <ThumbsDown className="w-8 h-8 text-red-500" />}
      </button>

      <button
        onClick={onAgree}
        className={`w-20 h-20 rounded-full shadow-lg flex justify-center hover:shadow-xl transition-all duration-200 active:scale-95 items-center ${
          isConversationMode
            ? "bg-gradient-to-r from-pink-500 to-purple-500"
            : "bg-gradient-to-r from-green-500 to-blue-500"
        }`}
        title={isConversationMode ? "Love it!" : "Agree"}
      >
        {isConversationMode ? (
          <Heart className="w-10 h-10 text-white fill-current" />
        ) : (
          <ThumbsUp className="w-10 h-10 text-white" />
        )}
      </button>
    </div>
  )
}

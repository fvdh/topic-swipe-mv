"use client"

import { topicCategories } from "../data/topics"

interface CategorySelectorProps {
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  topicCounts: Record<string, number>
}

export function CategorySelector({ selectedCategory, onCategoryChange, topicCounts }: CategorySelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Choose a Theme</h2>
      <div className="flex flex-col items-stretch gap-4">
        {topicCategories.map((category) => {
          const isSelected = selectedCategory === category.id
          const count = topicCounts[category.id] || 0

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`relative p-4 rounded-xl transition-all duration-200 ${
                isSelected
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-semibold text-sm">{category.name}</div>
              <div className={`text-xs mt-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}>{count} topics</div>
              {isSelected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"

interface NewTopic {
  title: string
  description: string
  category: string
  icon: string
}

export function TopicManager() {
  const [newTopic, setNewTopic] = useState<NewTopic>({
    title: "",
    description: "",
    category: "",
    icon: "💭"
  })
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const categories = [
    { value: "nature", label: "Nature" },
    { value: "technology", label: "Technology" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "health", label: "Health" },
    { value: "conversation", label: "Chat Starters" },
  ]

  const commonIcons = ["💭", "🌟", "🎯", "⚡", "🔥", "💡", "🎪", "🌈", "🚀", "🎨"]

  const addTopic = async () => {
    if (!newTopic.title || !newTopic.category) {
      setError("Title and category are required")
      return
    }

    try {
      setIsAdding(true)
      setError("")
      setMessage("")

      const topic = {
        id: crypto.randomUUID(),
        title: newTopic.title,
        description: newTopic.description,
        category: newTopic.category,
        icon: newTopic.icon,
        image: `/placeholder.svg?height=600&width=400&text=${encodeURIComponent(newTopic.title)}`
      }

      const response = await fetch("/api/topics/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topics: [topic] })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add topic")
      }

      setMessage(`Topic "${newTopic.title}" added successfully!`)
      setNewTopic({ title: "", description: "", category: "", icon: "💭" })
    } catch (error: any) {
      console.error("Add topic error:", error)
      setError(error.message)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Topic
        </CardTitle>
        <CardDescription>Create new topics for users to swipe on</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Pineapple belongs on pizza"
              value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={newTopic.category} onValueChange={(value) => setNewTopic({ ...newTopic, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the topic..."
            value={newTopic.description}
            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="flex gap-2 flex-wrap">
            {commonIcons.map((icon) => (
              <Button
                key={icon}
                variant={newTopic.icon === icon ? "default" : "outline"}
                size="sm"
                onClick={() => setNewTopic({ ...newTopic, icon })}
                className="text-lg p-2 w-10 h-10"
              >
                {icon}
              </Button>
            ))}
          </div>
          <Input
            placeholder="Or enter custom emoji"
            value={newTopic.icon}
            onChange={(e) => setNewTopic({ ...newTopic, icon: e.target.value })}
            className="w-20"
          />
        </div>

        <Button onClick={addTopic} disabled={isAdding} className="w-full">
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding Topic...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </>
          )}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Topics added here will be stored directly in the database. 
            To add them to your frontend code as well, add them to <code>data/topics.ts</code> and run sync.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

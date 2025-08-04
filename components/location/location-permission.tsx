"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertCircle, Loader2 } from "lucide-react"
import { getCurrentLocation, updateUserLocation } from "@/lib/location"

interface LocationPermissionProps {
  userId: string
  onLocationSet: () => void
}

export function LocationPermission({ userId, onLocationSet }: LocationPermissionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEnableLocation = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("Getting current location...")
      const location = await getCurrentLocation()
      console.log("Location obtained:", location)

      console.log("Updating user location...")
      await updateUserLocation(userId, location)
      console.log("Location updated successfully")

      onLocationSet()
    } catch (error: any) {
      console.error("Location permission error:", error)
      setError(error.message || "Failed to get location")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    console.log("User skipped location permission")
    onLocationSet()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Enable Location</CardTitle>
          <CardDescription>Find people near you and discover local conversation partners</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why we need your location:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Find compatible people nearby</li>
              <li>• Show distance in your matches</li>
              <li>• Discover local conversation topics</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Location Error</p>
                <p>{error}</p>
                <p className="mt-2 text-xs">
                  You can skip this step and still use the app, but you won't see distance-based matches.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={handleEnableLocation} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Enable Location
                </>
              )}
            </Button>

            <Button onClick={handleSkip} variant="outline" className="w-full bg-transparent">
              Skip for Now
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your location is only used for matching and is never shared with other users
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

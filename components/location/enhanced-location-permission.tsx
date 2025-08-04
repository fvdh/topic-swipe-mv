"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { MapPin, AlertCircle, Loader2, Globe, Users } from "lucide-react"
import { getCurrentLocation } from "@/lib/location"
import { saveLocationPreferences } from "@/lib/matching"

interface EnhancedLocationPermissionProps {
  userId: string
  onLocationSet: () => void
}

export function EnhancedLocationPermission({ userId, onLocationSet }: EnhancedLocationPermissionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [shareLocation, setShareLocation] = useState(true)
  const [maxDistance, setMaxDistance] = useState([50])
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
    city?: string
    country?: string
  } | null>(null)

  const handleGetLocation = async () => {
    if (!shareLocation) return

    setIsLoading(true)
    setError("")

    try {
      console.log("Getting current location...")
      const location = await getCurrentLocation()
      console.log("Location obtained:", location)
      setCurrentLocation(location)
    } catch (error: any) {
      console.error("Location error:", error)
      setError(error.message || "Failed to get location")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("Saving location preferences...")

      // Save location preferences
      await saveLocationPreferences(userId, {
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        city: currentLocation?.city,
        country: currentLocation?.country,
        maxDistance: shareLocation ? maxDistance[0] : 999999, // Infinite distance if not sharing location
        shareLocation,
      })

      console.log("Location preferences saved successfully")
      onLocationSet()
    } catch (error: any) {
      console.error("Save preferences error:", error)
      setError(error.message || "Failed to save preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const getDistanceText = (distance: number) => {
    if (distance >= 999999) return "Anywhere in the world"
    if (distance >= 1000) return `${Math.round(distance / 1000)}k km`
    return `${distance} km`
  }

  const getMatchingExplanation = () => {
    if (shareLocation && maxDistance[0] < 999999) {
      return `You'll see people within ${getDistanceText(maxDistance[0])} of your location.`
    } else if (shareLocation && maxDistance[0] >= 999999) {
      return "You'll see people from anywhere in the world."
    } else {
      return "You'll only see people who are also open to worldwide connections (infinite distance)."
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Location & Distance Preferences</CardTitle>
          <CardDescription>Set your location sharing and matching distance preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Sharing Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="share-location" className="text-base font-medium">
                  Share my location
                </Label>
                <p className="text-sm text-gray-500">Allow others to see your approximate location</p>
              </div>
              <Switch
                id="share-location"
                checked={shareLocation}
                onCheckedChange={setShareLocation}
                disabled={isLoading}
              />
            </div>

            {shareLocation && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Location Access</span>
                </div>
                {currentLocation ? (
                  <div className="text-sm text-blue-700">
                    <p>✓ Location obtained</p>
                    {currentLocation.city && (
                      <p>
                        {currentLocation.city}, {currentLocation.country}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700">Click to get your current location</p>
                    <Button onClick={handleGetLocation} disabled={isLoading} size="sm" variant="outline">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Get My Location
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!shareLocation && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Worldwide Matching</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Your location will be set to "worldwide" and you'll only match with others who also prefer worldwide
                  connections.
                </p>
              </div>
            )}
          </div>

          {/* Distance Preference */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Maximum matching distance</Label>
              <p className="text-sm text-gray-500">How far are you willing to connect with people?</p>
            </div>

            <div className="space-y-4">
              <div className="px-4">
                <Slider
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                  max={shareLocation ? 1000 : 999999}
                  min={shareLocation ? 5 : 999999}
                  step={shareLocation ? 5 : 0}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getDistanceText(maxDistance[0])}</div>
                <div className="text-sm text-gray-500 mt-1">{getMatchingExplanation()}</div>
              </div>

              {shareLocation && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>5 km</span>
                  <span>1000+ km</span>
                </div>
              )}
            </div>
          </div>

          {/* Matching Info */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">How Matching Works</span>
            </div>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Your preferences across ALL topic categories influence matches</li>
              <li>• Conversation starters have the highest weight in compatibility</li>
              <li>• Distance preferences must be mutual for a match to occur</li>
              <li>• You can change these settings anytime in your profile</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleSavePreferences}
              className="w-full"
              disabled={isLoading || (shareLocation && !currentLocation)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>

            {shareLocation && !currentLocation && (
              <p className="text-xs text-gray-500 text-center">
                Please get your location first, or disable location sharing to continue
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your exact location is never shared. Others only see your approximate city and distance.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

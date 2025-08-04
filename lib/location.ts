export interface LocationData {
  latitude: number
  longitude: number
  city?: string
  country?: string
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocoding to get city and country
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          )

          if (response.ok) {
            const data = await response.json()
            resolve({
              latitude,
              longitude,
              city: data.city || data.locality,
              country: data.countryName,
            })
          } else {
            // Return coordinates even if geocoding fails
            resolve({ latitude, longitude })
          }
        } catch (error) {
          console.warn("Geocoding failed, using coordinates only:", error)
          // Return coordinates even if geocoding fails
          resolve({ latitude, longitude })
        }
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}

export async function updateUserLocation(userId: string, location: LocationData) {
  const response = await fetch("/api/users/location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
      country: location.country,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || error.error || "Failed to update location")
  }

  return response.json()
}

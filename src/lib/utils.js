/**
 * Compute map centre based on a list of markers
 * @param markers Map markers to compute the centre of
 * @returns Map centre
 */
export function getMapCentre(markers) {
    const lats = markers.map(marker => marker.lngLat.lat)
    const lngs = markers.map(marker => marker.lngLat.lng)
    const latMin = Math.min(...lats)
    const latMax = Math.max(...lats)
    const lngMin = Math.min(...lngs)
    const lngMax = Math.max(...lngs)
    return { lng: (lngMin + lngMax) / 2, lat: (latMin + latMax) / 2 }
}

/**
 * Compute map bounds based on a list of markers
 * @param markers Map markers to compute the bounds of
 * @returns Map bounds
 */
export function getMapBounds(markers) {
    const lats = markers.map(marker => marker.lngLat.lat)
    const lngs = markers.map(marker => marker.lngLat.lng)
    const latMin = Math.min(...lats)
    const latMax = Math.max(...lats)
    const lngMin = Math.min(...lngs)
    const lngMax = Math.max(...lngs)
    return [lngMin, latMin, lngMax, latMax]
}

/**
 * Compute the distance between two markers
 * @param markers Map markers to compute the distance between
 * @returns Distance between the two markers
 */
export function getDistance(markers) {
    if (markers.length !== 2) {
        throw new Error('This function requires exactly two markers')
    }

    const R = 6371e3 // Earth's radius in metres
    const phi1 = markers[0].lngLat.lat * Math.PI / 180 // phi, lambda in radians
    const phi2 = markers[1].lngLat.lat * Math.PI / 180
    const dPhi = (markers[1].lngLat.lat - markers[0].lngLat.lat) * Math.PI / 180
    const dLambda = (markers[1].lngLat.lng - markers[0].lngLat.lng) * Math.PI / 180

    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2)
        + Math.cos(phi1) * Math.cos(phi2)
        * Math.sin(dLambda / 2) * Math.sin(dLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = R * c // in metres

    return distance
}

/**
 * Compute the distance between two markers
 * @param markers Map markers to compute the distance between
 * @returns Distance between the two markers
 */
// Define an array UHI, from 10.20°C to -7.16°C
const uhiList = [
    '10.20°C ♨',
    '9.80°C ♨',
    '8.40°C ♨',
    '7.90°C ♨',
    '6.30°C ♨',
    '5.20°C ♨',
    '4.80°C ♨',
    '3.70°C ♨',
    '3.20°C ♨',
    '0.50°C ♨',
    '-1.30°C ❆',
    '-2.50°C ❆',
    '-3.20°C ❆',
    '-4.40°C ❆',
    '-5.60°C ❆',
    '-6.70°C ❆',
    '-7.16°C ❆',
]

export function getUHI() {
    // Return some randome Urban Heat Island Index
    let randomIndex = Math.floor(Math.random() * uhiList.length) // Generate a random index
    return uhiList[randomIndex] // Get the item at that index

}


// Define an array of items
const cropStopMessages = [
    'Congrats, you won a soil packet ✵',
    'Congrats, you won a seed packet ⁂',
    'Congrats, you won a magic grow packet 🌟',
    'Congrats, you won a time bonus packet ⌚',
]

export function getCropStopPrize() {
    const randomIndex = Math.floor(Math.random() * cropStopMessages.length) // Generate a random index
    return cropStopMessages[randomIndex] // Get the item at that index
}

export function generateTrackingNumber(orderNumber) {
  const paddedOrder = String(orderNumber ?? 0).padStart(5, '0')
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()

  return `SS-${paddedOrder}-${randomSuffix}`
}
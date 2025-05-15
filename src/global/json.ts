export const isValidJson = (json: string) => {
  try {
    const val = JSON.parse(json)
    return typeof val === 'object' && !Array.isArray(val) && val !== null
  } catch {
    return false
  }
}

/**
 * Box ID Generator
 * Generates unique box IDs in format: BOX-YYYY-NNN
 * Example: BOX-2024-001, BOX-2024-002
 */

/**
 * Generate a unique box ID
 * @param sequence - The sequence number for the box (optional, will generate based on timestamp if not provided)
 * @returns A formatted box ID string
 */
export function generateBoxId(sequence?: number): string {
  const year = new Date().getFullYear()
  
  if (sequence !== undefined) {
    const paddedSequence = sequence.toString().padStart(3, '0')
    return `BOX-${year}-${paddedSequence}`
  }
  
  // Generate sequence based on timestamp (last 3 digits of timestamp)
  const timestamp = Date.now()
  const autoSequence = (timestamp % 1000).toString().padStart(3, '0')
  return `BOX-${year}-${autoSequence}`
}

/**
 * Format box ID for printing labels
 * Adds spacing and formatting for better readability
 * @param boxId - The box ID to format
 * @returns Formatted string for printing
 */
export function formatBoxIdForPrint(boxId: string): string {
  // Split BOX-2024-001 into parts
  const parts = boxId.split('-')
  if (parts.length !== 3) {
    return boxId // Return as-is if format is unexpected
  }
  
  return `${parts[0]} ${parts[1]} #${parts[2]}`
}

/**
 * Validate box ID format
 * @param boxId - The box ID to validate
 * @returns True if valid format, false otherwise
 */
export function isValidBoxId(boxId: string): boolean {
  const boxIdPattern = /^BOX-\d{4}-\d{3}$/
  return boxIdPattern.test(boxId)
}

/**
 * Parse box ID to extract year and sequence
 * @param boxId - The box ID to parse
 * @returns Object with year and sequence, or null if invalid
 */
export function parseBoxId(boxId: string): { year: number; sequence: number } | null {
  if (!isValidBoxId(boxId)) {
    return null
  }
  
  const parts = boxId.split('-')
  return {
    year: parseInt(parts[1], 10),
    sequence: parseInt(parts[2], 10),
  }
}

/**
 * Generate a batch of box IDs
 * @param count - Number of box IDs to generate
 * @param startSequence - Starting sequence number (default: 1)
 * @returns Array of box IDs
 */
export function generateBoxIdBatch(count: number, startSequence: number = 1): string[] {
  const boxIds: string[] = []
  
  for (let i = 0; i < count; i++) {
    boxIds.push(generateBoxId(startSequence + i))
  }
  
  return boxIds
}

/**
 * Get the next box ID based on the last used ID
 * @param lastBoxId - The last box ID that was used
 * @returns The next box ID in sequence
 */
export function getNextBoxId(lastBoxId: string): string {
  const parsed = parseBoxId(lastBoxId)
  
  if (!parsed) {
    // If invalid, generate a new one
    return generateBoxId(1)
  }
  
  const currentYear = new Date().getFullYear()
  
  // If year has changed, reset sequence to 1
  if (parsed.year !== currentYear) {
    return generateBoxId(1)
  }
  
  // Otherwise, increment sequence
  return generateBoxId(parsed.sequence + 1)
}


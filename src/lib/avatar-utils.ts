// Generate a consistent color based on a string (userId or email)
export function generateColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generate a pleasant color palette
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Orange
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B88B', // Peach
    '#52B788', // Green
    '#E63946', // Crimson
    '#457B9D', // Steel Blue
  ]
  
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// Get initials from name or email
export function getInitials(name?: string, email?: string): string {
  if (name && name !== email) {
    // Get initials from name
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  
  // Fallback to email
  if (email) {
    const emailPart = email.split('@')[0]
    return emailPart.substring(0, 2).toUpperCase()
  }
  
  return 'U'
}

// Get user display name
export function getUserDisplayName(name?: string, email?: string): string {
  if (name && name !== email) {
    return name
  }
  
  if (email) {
    return email.split('@')[0]
  }
  
  return 'User'
}



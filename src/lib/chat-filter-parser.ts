export interface ParsedQuery {
  type: 'search' | 'operation_data' | 'create' | 'update' | 'delete'
  action?: 'add_batch' | 'add_crate' | 'record_cooking' | 'update_location' | 'change_status' | 'move_crate' | 'remove_batch' | 'delete_crate' | 'view_all_locations' | 'list_batches'
  searchTerms: string[]
  filters: {
    boxIds?: string[]
    crateIds?: string[]
    batches?: string[]
    locations?: string[]
    products?: string[]
    sizes?: string[]
  }
  parameters?: {
    batchId?: string
    crateId?: string
    location?: string
    newLocation?: string
    status?: string
    product?: string
    size?: string
    quantity?: number
    itemType?: string
  }
  batchForOperation?: string
  rawQuery: string
}

export function parseChatQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase().trim()
  
  const result: ParsedQuery = {
    type: 'search',
    searchTerms: [],
    filters: {},
    parameters: {},
    rawQuery: query,
  }

  // Check if user wants to open operation data
  const operationMatch = lowerQuery.match(/open\s+([a-z0-9-]+)\s+operation\s+data/i)
  if (operationMatch) {
    result.type = 'operation_data'
    result.batchForOperation = operationMatch[1].toUpperCase()
    return result
  }

  // Check for CREATE commands
  if (/\b(add|create|new|record)\b/i.test(lowerQuery)) {
    result.type = 'create'
    
    if (/\bbatch\b/i.test(lowerQuery)) {
      result.action = 'add_batch'
      const batchMatch = query.match(/batch\s+([A-Z0-9]+)/i)
      if (batchMatch) result.parameters!.batchId = batchMatch[1].toUpperCase()
    } else if (/\bcrate\b/i.test(lowerQuery)) {
      result.action = 'add_crate'
      const crateMatch = query.match(/crate\s+([C]-?\d+)/i)
      if (crateMatch) result.parameters!.crateId = crateMatch[1].toUpperCase()
    } else if (/\bcooking\b/i.test(lowerQuery)) {
      result.action = 'record_cooking'
    }
    
    // Extract additional parameters
    const locationMatch = query.match(/(?:at|in|to)\s+location\s+([A-Z]-?\d+)/i)
    if (locationMatch) result.parameters!.location = locationMatch[1].toUpperCase()
    
    const quantityMatch = query.match(/(\d+)\s+(?:jars|units|items)/i)
    if (quantityMatch) result.parameters!.quantity = parseInt(quantityMatch[1])
    
    return result
  }

  // Check for UPDATE commands
  if (/\b(update|change|move|edit|modify)\b/i.test(lowerQuery)) {
    result.type = 'update'
    
    if (/\blocation\b/i.test(lowerQuery)) {
      result.action = 'update_location'
      const fromMatch = query.match(/from\s+(?:location\s+)?([A-Z]-?\d+)/i)
      const toMatch = query.match(/to\s+(?:location\s+)?([A-Z]-?\d+)/i)
      if (fromMatch) result.parameters!.location = fromMatch[1].toUpperCase()
      if (toMatch) result.parameters!.newLocation = toMatch[1].toUpperCase()
    } else if (/\bstatus\b/i.test(lowerQuery)) {
      result.action = 'change_status'
      if (/\blabeled\b/i.test(lowerQuery)) result.parameters!.status = 'Labeled'
      if (/\bunlabeled\b/i.test(lowerQuery)) result.parameters!.status = 'Unlabeled'
    } else if (/\bmove\b.*\bcrate\b/i.test(lowerQuery)) {
      result.action = 'move_crate'
      const crateMatch = query.match(/crate\s+([C]-?\d+)/i)
      const locationMatch = query.match(/to\s+(?:location\s+)?([A-Z]-?\d+)/i)
      if (crateMatch) result.parameters!.crateId = crateMatch[1].toUpperCase()
      if (locationMatch) result.parameters!.newLocation = locationMatch[1].toUpperCase()
    }
    
    return result
  }

  // Check for DELETE commands
  if (/\b(delete|remove)\b/i.test(lowerQuery)) {
    result.type = 'delete'
    
    if (/\bbatch\b/i.test(lowerQuery)) {
      result.action = 'remove_batch'
      const batchMatch = query.match(/batch\s+([A-Z0-9]+)/i)
      if (batchMatch) result.parameters!.batchId = batchMatch[1].toUpperCase()
    } else if (/\bcrate\b/i.test(lowerQuery)) {
      result.action = 'delete_crate'
      const crateMatch = query.match(/crate\s+([C]-?\d+)/i)
      if (crateMatch) result.parameters!.crateId = crateMatch[1].toUpperCase()
    }
    
    return result
  }

  // Check for VIEW commands
  if (/\b(view|list|show)\s+(all\s+)?(locations|batches)\b/i.test(lowerQuery)) {
    result.type = 'search'
    
    if (/\blocations\b/i.test(lowerQuery)) {
      result.action = 'view_all_locations'
    } else if (/\bbatches\b/i.test(lowerQuery)) {
      result.action = 'list_batches'
    }
    
    return result
  }

  // Extract Box IDs (e.g., "box ID 45-3", "box 45-3", "BOX-45-3")
  const boxIdMatches = query.match(/box[\s-]*(id)?[\s:-]*([a-z0-9-]+)/gi)
  if (boxIdMatches) {
    result.filters.boxIds = boxIdMatches.map(match => {
      const cleaned = match.replace(/box[\s-]*(id)?[\s:-]*/gi, '').toUpperCase()
      return cleaned.startsWith('BOX-') ? cleaned : `BOX-${cleaned}`
    })
    result.searchTerms.push(...(result.filters.boxIds || []))
  }

  // Extract Crate IDs (e.g., "crate C-44", "C-44", "crate C44")
  const crateIdMatches = query.match(/(?:crate[\s-]*)?([cC]-?\d+)/gi)
  if (crateIdMatches) {
    result.filters.crateIds = crateIdMatches.map(match => {
      const cleaned = match.replace(/crate[\s-]*/gi, '').toUpperCase()
      return cleaned.includes('-') ? cleaned : `C-${cleaned.replace('C', '')}`
    })
    result.searchTerms.push(...(result.filters.crateIds || []))
  }

  // Extract Batch IDs (e.g., "UFC324", "batch UFC324")
  const batchMatches = query.match(/(?:batch[\s-]*)?(UFC\d+)/gi)
  if (batchMatches) {
    result.filters.batches = batchMatches.map(match =>
      match.replace(/batch[\s-]*/gi, '').toUpperCase()
    )
    result.searchTerms.push(...(result.filters.batches || []))
  }

  // Extract Locations (e.g., "location B-1", "B-1", "A-2")
  const locationMatches = query.match(/(?:location[\s-]*)?([A-Z]-?\d+)/gi)
  if (locationMatches) {
    result.filters.locations = locationMatches
      .map(match => match.replace(/location[\s-]*/gi, '').toUpperCase())
      .filter(loc => !loc.startsWith('C-')) // Exclude crate IDs
      .map(loc => loc.includes('-') ? loc : `${loc[0]}-${loc.substring(1)}`)
    if (result.filters.locations.length > 0) {
      result.searchTerms.push(...result.filters.locations)
    } else {
      delete result.filters.locations
    }
  }

  // Extract Product names
  const productPatterns = [
    { pattern: /universal\s+flare/gi, name: 'Universal Flare' },
    { pattern: /thyme\s+(?:&|and)\s+tea\s+tree/gi, name: 'Thyme & Tea Tree' },
    { pattern: /comfrey\s+(?:&|and)\s+arnica/gi, name: 'Comfrey & Arnica' },
  ]
  
  for (const { pattern, name } of productPatterns) {
    if (pattern.test(lowerQuery)) {
      result.filters.products = result.filters.products || []
      result.filters.products.push(name)
      result.searchTerms.push(name)
    }
  }

  // Extract Sizes (e.g., "4oz", "2oz", "1oz")
  const sizeMatches = query.match(/([1-4])\s*oz/gi)
  if (sizeMatches) {
    result.filters.sizes = sizeMatches.map(match =>
      match.replace(/\s/g, '').toLowerCase()
    )
    result.searchTerms.push(...result.filters.sizes)
  }

  // Extract item types
  if (/\b(labeled|labelled)\b/i.test(lowerQuery)) {
    result.searchTerms.push('Labeled')
  }
  if (/\bunlabeled\b/i.test(lowerQuery)) {
    result.searchTerms.push('Unlabeled')
  }
  if (/\bbox(es)?\b/i.test(lowerQuery) && !result.filters.boxIds) {
    result.searchTerms.push('Box')
  }

  // If no specific filters found, use the whole query as search term
  if (result.searchTerms.length === 0) {
    result.searchTerms.push(query)
  }

  return result
}

export function generateResponseMessage(parsedQuery: ParsedQuery, matchCount: number): string {
  if (parsedQuery.type === 'operation_data') {
    return `Opening operation data for batch ${parsedQuery.batchForOperation}...`
  }

  if (matchCount === 0) {
    return `I couldn't find any items matching "${parsedQuery.rawQuery}". Try:\n• Using a different search term\n• Checking the spelling\n• Searching by batch number (e.g., UFC324)`
  }

  if (matchCount === 1) {
    return `Found 1 item matching your search. I've highlighted it in the table below.`
  }

  const filterDescriptions = []
  if (parsedQuery.filters.crateIds?.length) {
    filterDescriptions.push(`crate ${parsedQuery.filters.crateIds.join(', ')}`)
  }
  if (parsedQuery.filters.batches?.length) {
    filterDescriptions.push(`batch ${parsedQuery.filters.batches.join(', ')}`)
  }
  if (parsedQuery.filters.locations?.length) {
    filterDescriptions.push(`location ${parsedQuery.filters.locations.join(', ')}`)
  }
  if (parsedQuery.filters.products?.length) {
    filterDescriptions.push(parsedQuery.filters.products.join(', '))
  }

  const description = filterDescriptions.length > 0 
    ? ` for ${filterDescriptions.join(' · ')}`
    : ''

  return `Found ${matchCount} items${description}. I've filtered and highlighted them in the table below.`
}


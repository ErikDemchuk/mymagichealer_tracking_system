# Production Tracking System - Specification

**Last Updated:** October 31, 2025  
**Status:** Planning Phase

---

## Business Overview

MyMagicHealer produces skin healing jars in 4 sizes (1oz, 2oz, 4oz, 8oz) with different formulations (Universal Flare Care, Thyme & Tea Tree, Comfrey & Arnica, Universal EO-Free). The production process involves:

1. **Cook** → Produce jars (Unlabeled)
2. **Label** → Apply labels (Labeled)
3. **Pack** → Package for shipping (Amazon Box / Shopify Box)
4. **Ship** → Send to Amazon FBA or Shopify customers

Products are stored in **crates** at various **locations** throughout the facility. Location-based tracking is the primary organizational method.

---

## Product Information

### Product Variations (from website)
- Universal Flare Care (purple jar)
- Thyme & Tea Tree Flare Care (green jar)
- Comfrey & Arnica Relief (blue jar)
- Universal Flare Care EO-Free (purple jar)

### Sizes
- 1oz
- 2oz
- 4oz
- 8oz (if applicable)

### Naming Convention
Simple descriptive names: "4oz purple", "2oz green", "4oz blue", "4oz purple EO-free"
**Note:** Full product names will be defined later by user.

### Batch IDs
Format: UFC324, UFC325, UFC326, etc.
- Identifies production batch
- Tracks when items were cooked

---

## Inventory States (Item_Type)

| State | Description | Requires Crate | Storage |
|-------|-------------|----------------|---------|
| **Unlabeled_Jar** | Freshly cooked, no labels | ✅ Yes | Crates |
| **Labeled** | Labeled, ready to pack | ✅ Yes | Crates |
| **Amazon_Box** | Packed for Amazon FBA | ❌ No | Boxes |
| **Shopify_Box** | Packed for customer orders | ❌ No | Boxes |

---

## Storage System

### Locations
Facility locations: B-1, B-2, B-3, B-4, B-5, B-6, B-7, B-8, B-9, A-1, A-2, A-3, A-4, A-5, A-6, C1, C2, C3, D-1, D-2, etc.

### Crates
- Used for **Unlabeled_Jar** and **Labeled** items only
- Identified by ID: C-32, C-44, C-55, etc.
- One crate = one inventory entry (no multiple batches per crate)
- When labeling, items MUST switch to a new crate

### Boxes (Amazon/Shopify)
- No crate tracking needed
- Items are already packaged
- Tracked by location only
- Optional: May add box IDs later

---

## Database Structure

### MongoDB Collection: `production_inventory`

```typescript
interface InventoryEntry {
  _id: string                    // Auto-generated
  location: string               // "B-1", "A-2", "D-3"
  item_type: "Unlabeled_Jar" | "Labeled" | "Amazon_Box" | "Shopify_Box"
  crate_id: string | null        // Required for jars, null for boxes
  batch: string                  // "UFC324", "UFC325"
  units: number                  // Jar/box count
  size: "1oz" | "2oz" | "4oz" | "8oz"  // Jar size
  product: string                // "purple", "green", "blue"
  product_full_name: string      // "Universal Flare Care", "Thyme & Tea Tree"
  timestamp: Date                // When created/updated
  history: HistoryEntry[]        // Track all changes
  createdAt: Date
  updatedAt: Date
}

interface HistoryEntry {
  action: "created" | "moved" | "labeled" | "packed" | "shipped"
  previousLocation?: string
  previousCrate?: string
  previousItemType?: string
  user: string
  timestamp: Date
  notes?: string
}
```

### Indexes
- `location` (primary grouping for queries)
- `crate_id` (for crate lookups)
- `batch` (for batch tracking)
- `item_type` (filter by state)

---

## Operations & Business Logic

### 1. Cook Action (`/cook`)
**Purpose:** Record newly cooked jars

**Modal Fields:**
- Batch Number (required) - e.g., UFC324
- Storage Location (required) - e.g., B-1
- Product Type (required) - e.g., 4oz purple
- Crate ID (required) - e.g., C-32
- Jar Count (required) - e.g., 200
- Job/Box Number (optional)
- Summary (optional)

**Database Action:**
- CREATE new entry
- item_type = "Unlabeled_Jar"
- Store all fields

**Rules:**
- Crate ID is required
- Creates new inventory entry

---

### 2. Label Action (`/label`)
**Purpose:** Label jars and move to new crate

**Modal Fields:**
- Source Crate ID (optional - for lookup)
- New Crate ID (required) - where labeled jars go
- New Location (optional - if moving)
- Other fields (optional - if empty, keep existing values)

**Database Action:**
- FIND entry by source crate_id
- UPDATE entry:
  - item_type: "Unlabeled_Jar" → "Labeled"
  - crate_id: old → new
  - location: old → new (if provided)
- ADD to history log

**Rules:**
- Crate MUST change (labeling = new crate)
- If field is empty in modal, keep existing value
- Location can stay same or change

---

### 3. Pack Action (`/pack`)
**Purpose:** Pack labeled jars into Amazon/Shopify boxes

**Modal Fields:** (To be defined)
- Source Crate ID (to find labeled jars)
- Destination Location
- Box Type (Amazon / Shopify)
- Units to pack
- Box ID (optional)

**Database Action:**
- FIND entry by source crate_id
- UPDATE entry:
  - item_type: "Labeled" → "Amazon_Box" or "Shopify_Box"
  - crate_id: → null (no longer in crate)
  - box_id: optional tracking
  - location: update if moving

**Rules:**
- Crate ID becomes null (boxes don't use crates)
- May need to split entry if packing partial quantity

**Open Questions:**
- Do we remove the source crate entry or reduce its count?
- Can we pack partial quantities from a crate?

---

### 4. Ship Action (`/ship`)
**Purpose:** Record shipments to Amazon FBA or customers

**Modal Fields:** (To be defined)
- Source Location
- Item Type (Amazon_Box / Shopify_Box)
- Units to ship
- Destination (FBA warehouse / customer)

**Database Action:**
- FIND entries by location and item_type
- DELETE or REDUCE unit count
- LOG shipment in history

**Open Questions:**
- Should shipped items be deleted or archived?
- Track shipment destination?

---

### 5. Move Action (`/move`)
**Purpose:** Relocate items without changing state

**Modal Fields:** (To be defined)
- Crate ID or Box identifier
- New Location

**Database Action:**
- FIND entry
- UPDATE location only
- ADD to history

**Status:** To be defined later

---

## Dashboard Display (Final Design)

### Layout Structure
```
┌──────┬───────────────────────────────────────────────────────────┐
│ Side │  ┌─────────┬─────────┬─────────┬─────────┐  [+ Add]     │
│ bar  │  │   All   │Unlabeled│ Labeled │  Boxes  │              │
│      │  │  1,243  │   450   │   380   │   413   │              │
│Chat  │  └─────────┴─────────┴─────────┴─────────┘              │
│List  │                                                           │
│      │  [Location ▼] [Product ▼] [Batch ▼]  🔍 Search...       │
│      │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│      │                                                           │
│      │  ▼ 📍 Location: B-1                  (5 items)  +Add    │
│      │    │                                                      │
│      │    ├─ ▼ Purple (Universal Flare)      (3 items)         │
│      │    │   ┌───────┬─────────┬───────┬──────┬──────┬──────┐ │
│      │    │   │Crate  │ItemType │ Batch │Units │ Size │  ⋮   │ │
│      │    │   ├───────┼─────────┼───────┼──────┼──────┼──────┤ │
│      │    │   │🗄️ C-32│Unlabeled│UFC324 │ 200  │ 4oz  │  ⋮   │ │
│      │    │   │🗄️ C-35│Labeled  │UFC325 │ 150  │ 4oz  │  ⋮   │ │
│      │    │   │🗄️ C-36│Labeled  │UFC326 │ 180  │ 2oz  │  ⋮   │ │
│      │    │   └───────┴─────────┴───────┴──────┴──────┴──────┘ │
│      │    │                                                      │
│      │    └─ ▶ Green (Thyme & Tea Tree)      (2 items)  +Add   │
│      │                                                           │
│      │  ▼ 📍 Location: B-4                  (3 items)  +Add    │
│      │    │                                                      │
│      │    └─ ▼ Amazon Boxes                  (3 items)         │
│      │        ┌───────┬─────────┬───────┬──────┬──────┬──────┐ │
│      │        │📦 --  │AmazonBox│UFC325 │  72  │ 4oz  │  ⋮   │ │
│      │        │📦 --  │AmazonBox│UFC326 │  72  │ 4oz  │  ⋮   │ │
│      │        └───────┴─────────┴───────┴──────┴──────┴──────┘ │
└──────┴───────────────────────────────────────────────────────────┘
```

### Table Column Order
1. **Crate** (100px) - 🗄️ C-32 or 📦 -- for boxes
2. **Item Type** (120px) - Unlabeled, Labeled, Amazon Box, Shopify Box
3. **Batch** (100px) - UFC324, UFC325
4. **Units** (80px) - 200, 150
5. **Size** (80px) - 1oz, 2oz, 4oz, 8oz
6. **Actions** (50px) - ⋮ menu

### Display Logic
- Reuse existing chat sidebar navigation
- Group entries by `location` (primary)
- Sub-group by `product` (secondary: purple, green, blue)
- Sort locations alphabetically
- Collapsible sections for location and product
- Real-time updates when data changes
- No user tracking, no progress bars

---

## Technical Architecture

### Current System (Chat-Based)
```
User → Chat Interface → Modal → handleFormSubmit()
                                      ↓
                            ┌─────────┴─────────┐
                            ↓                   ↓
                      N8N Webhook       Chat Message
                                        (display only)
```

### New System (With Database)
```
User → Chat Interface → Modal → handleFormSubmit()
                                      ↓
                            ┌─────────┴──────────┐
                            ↓                    ↓
                    Inventory API         Chat Message
                   (MongoDB Service)      (with status)
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
              MongoDB DB      Google Sheets View
           (source of truth)   (location-grouped)
```

### New Components to Build

#### 1. Database Layer
- **`src/lib/models/Inventory.ts`** - Mongoose schema
- **`src/lib/inventory-service.ts`** - CRUD operations

#### 2. API Routes
- **`src/app/api/inventory/route.ts`** - Create/query entries
- **`src/app/api/inventory/[id]/route.ts`** - Update/delete entry
- **`src/app/api/inventory/query/route.ts`** - Advanced queries

#### 3. Frontend Components
- **`src/components/inventory-view.tsx`** - Google Sheets display
- **`src/components/label-form.tsx`** - Label action modal
- **`src/components/pack-form.tsx`** - Pack action modal
- **`src/components/ship-form.tsx`** - Ship action modal

#### 4. Updated Components
- **`src/components/cook-form.tsx`** - Keep existing, integrate inventory API
- **`src/components/chat-interface.tsx`** - Add inventory API calls

---

## AI Agent Capabilities

### Current Agent Role
- Processes chat messages
- Opens modals via slash commands (`/cook`)
- Displays form data in chat
- Sends to N8N webhook

### Enhanced Agent Role
1. **Data Validation** - Ensure required fields present
2. **Database Operations** - Create/update inventory entries
3. **Natural Language Queries** - "How many 4oz purple in B-1?"
4. **Smart Updates** - Determine create vs update based on context
5. **History Tracking** - Log all changes with user/timestamp
6. **Error Handling** - Graceful failure messaging
7. **Status Reporting** - Confirm actions in chat

### AI Processing Flow
```
User: "I cooked 200 4oz purple UFC324 in crate C-32 at B-1"
  ↓
Agent parses intent: /cook action
  ↓
Opens /cook modal (pre-filled if possible)
  ↓
User confirms/edits → Submits
  ↓
Agent calls Inventory API
  ↓
Database updated
  ↓
Agent confirms: "✅ Added 200 units of 4oz purple (UFC324) to Crate C-32 at B-1"
```

---

## Update Rules & Edge Cases

### Rule 1: Empty Fields = Keep Existing
When updating an entry, if a modal field is empty/not filled:
- **Keep the existing value** from the database
- Only update fields that have new values

### Rule 2: Crate Changes During Label
When labeling:
- **Must** switch to a new crate (business requirement)
- Old crate ID → New crate ID
- Item_Type: Unlabeled_Jar → Labeled

### Rule 3: No Crates for Boxes
When item_type = Amazon_Box or Shopify_Box:
- crate_id = null
- Modal should not show/require crate field

### Rule 4: Location Flexibility
- Items can be moved at any time
- Location is independent of item_type
- Use `/move` or update location in any modal

---

## Open Questions & To Be Defined

### Product Names
- ❓ Full list of product name conventions to be provided
- ❓ Confirm naming format (currently: "4oz purple", "2oz green")

### Operations
- ❓ `/pack` modal fields and logic details
- ❓ `/ship` modal fields and logic details
- ❓ `/move` modal fields and logic details
- ❓ Any other operations needed?

### Packing Logic
- ❓ When packing from Labeled → Amazon_Box:
  - Remove source crate entry completely?
  - Reduce unit count if partial pack?
  - Track which crate items came from?

### Box Tracking
- ❓ Do we need box IDs for Amazon/Shopify boxes?
- ❓ How granular should box tracking be?

### Shipping Logic
- ❓ When shipping, delete entries or archive?
- ❓ Track shipment destinations?
- ❓ Create separate shipment history table?

---

## Implementation Status

### ✅ Completed
- Chat interface with AI agent
- MongoDB connection
- Cook modal and form submission
- N8N webhook integration
- User authentication
- Chat history storage

### 🚧 In Progress
- System specification documentation (this file)
- Planning database schema
- Defining all operations

### 📋 To Do
- Create Inventory schema and service
- Build inventory API routes
- Integrate inventory API with cook-form
- Create Google Sheets-style view component
- Build label-form modal
- Build pack-form modal
- Build ship-form modal
- Add natural language query support
- Testing and validation

---

## Notes & Decisions Log

**2025-10-31:**
- Initial system specification created
- Confirmed location-centric approach
- Confirmed crate requirement for jars only (not boxes)
- Confirmed crate must change when labeling
- Confirmed simple product naming (e.g., "purple", "green", "blue")
- Confirmed 4 item types: Unlabeled_Jar, Labeled, Amazon_Box, Shopify_Box
- Two-level grouping: Location → Product
- Dashboard integrated with existing chat sidebar
- Column order: Crate, Item Type, Batch, Units, Size
- Added size field (1oz, 2oz, 4oz, 8oz) to schema
- Removed: sidebar nav, progress bars, user tracking
- Product names and additional operations to be defined later

---

*This document will be updated as the system evolves and new requirements are clarified.*



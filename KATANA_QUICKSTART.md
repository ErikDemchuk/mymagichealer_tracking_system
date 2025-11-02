# Katana API Integration - Quick Start Guide

## 🚀 Getting Started

### Step 1: Configure Environment

1. Copy environment example:
```bash
cp env.katana.example .env.local
```

2. Add your credentials to `.env.local`:
```bash
KATANA_API_KEY=91cecadd-5ac5-4f39-a312-65a566454700
KATANA_BASE_URL=https://api.katanamrp.com/v1
WEBHOOK_SECRET=your_random_secret_here
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Test Connection

Open browser console and run:
```javascript
const client = await import('/lib/katana/client');
const connected = await client.getKatanaClient().testConnection();
console.log(connected ? '✅ Connected!' : '❌ Failed');
```

---

## 📝 Using Commands in Your Chat

### /cook Command

When cooking is complete:

```typescript
// In your chat handler:
const result = await fetch('/api/commands/cook', {
  method: 'POST',
  body: JSON.stringify({
    manufacturingOrderId: moId,
    batchNumber: 'UFC344C',
    actualQuantity: 857,
    crateId: 'CRATE-047',
    location: 'A-12-3',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
  }),
});

const data = await result.json();
if (data.success) {
  // Show success message in chat
  // Labeling task auto-created
}
```

### /label Command

```typescript
const result = await fetch('/api/commands/label', {
  method: 'POST',
  body: JSON.stringify({
    manufacturingOrderId: moId,
    batchNumber: 'UFC344C',
    sourceCrateId: 'CRATE-047',
    sourceLocation: 'A-12-3',
    destinationCrateId: 'CRATE-108',
    destinationLocation: 'B-05-2',
    quantityLabeled: 857,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
  }),
});
```

### /pack Command

```typescript
const result = await fetch('/api/commands/pack', {
  method: 'POST',
  body: JSON.stringify({
    manufacturingOrderId: moId,
    batchNumber: 'UFC344C',
    sourceCrateId: 'CRATE-108',
    productSize: '2oz',
    retailBoxesPacked: 857,
    ulineBoxesUsed: 8,
    guidelinesUsed: 857,
    destination: 'fba',
    packedBy: 'John Doe',
  }),
});
```

### /ship Command

**FBA Shipment:**
```typescript
const result = await fetch('/api/commands/ship', {
  method: 'POST',
  body: JSON.stringify({
    shipmentType: 'fba',
    orders: [{ orderId: soId, batchNumber: 'UFC344C', quantity: 857 }],
    trackingNumbers: ['1Z999AA10123456784'],
    carrier: 'UPS Freight',
    shipDate: new Date().toISOString(),
    palletId: 'FBA-PALLET-2025-328',
  }),
});
```

**Shopify Orders:**
```typescript
const result = await fetch('/api/commands/ship', {
  method: 'POST',
  body: JSON.stringify({
    shipmentType: 'shopify',
    orders: [
      { orderId: 'SO-12345', batchNumber: 'UFC344C', quantity: 2 },
      { orderId: 'SO-12346', batchNumber: 'UFC344C', quantity: 3 },
    ],
    trackingNumbers: ['9400111899563892304753', '9400111899563892304760'],
    carrier: 'USPS',
    shipDate: new Date().toISOString(),
  }),
});
```

### /receive Command (with Photo)

```typescript
// User uploads photo of packing slip
const photoBase64 = await convertImageToBase64(uploadedFile);

const result = await fetch('/api/commands/receive', {
  method: 'POST',
  body: JSON.stringify({
    purchaseOrderId: poId,
    items: [
      {
        variantId: 'D-OIL',
        quantityReceived: 450,
        batchNumber: '2501030626',
      },
    ],
    receivedDate: new Date().toISOString(),
    photoBase64: photoBase64,
  }),
});

// AI will extract data from photo and match to PO
```

---

## 🔗 Setting Up Webhooks

### Step 1: Deploy to Vercel

```bash
vercel deploy --prod
```

Note your production URL (e.g., `https://your-app.vercel.app`)

### Step 2: Configure in Katana

1. Log into Katana
2. Go to **Settings** → **Integrations** → **Webhooks**
3. Click **"Create Webhook"**
4. Enter details:
   - **URL**: `https://your-app.vercel.app/api/webhooks/katana`
   - **Description**: Production Tracker Integration
   - **Events**: Select:
     - `manufacturing_order.created`
     - `manufacturing_order.updated`
     - `manufacturing_order.completed`
     - `inventory.updated`
     - `inventory.low_stock`
     - `purchase_order.received`
     - `sales_order.created`
     - `sales_order.fulfilled`
   - **Secret**: Copy from your `WEBHOOK_SECRET` in `.env.local`

5. Click **"Save"**

### Step 3: Test Webhook

1. In Katana, create a test manufacturing order
2. Check Vercel logs: `vercel logs --prod`
3. Should see: `✅ Webhook received: manufacturing_order.created`

---

## 📊 Dashboard Integration

### Get Production Metrics

```typescript
// Create API route: /api/dashboard/production
import { getActiveTasks } from '@/lib/katana/mongodb/models';

export async function GET() {
  const tasks = await getActiveTasks();
  return Response.json({ tasks });
}
```

### Get Inventory Levels

```typescript
// Create API route: /api/dashboard/inventory
import { InventoryCache } from '@/lib/katana/mongodb/models';

export async function GET() {
  const inventory = await InventoryCache.find().sort({ updatedAt: -1 });
  return Response.json({ inventory });
}
```

### Get Low Stock Alerts

```typescript
import { getLowStockItems } from '@/lib/katana/mongodb/models';

const lowStock = await getLowStockItems(50);
// Display in dashboard
```

---

## 🤖 AI Purchase Recommendations

```typescript
// In your AI agent:
import { getInventoryService } from '@/lib/katana/services';

const inventoryService = getInventoryService();
const lowStock = await inventoryService.getLowStockItems();

// Generate recommendations
const recommendations = lowStock.map((item) => ({
  variantName: item.variant_name,
  currentStock: item.available,
  reorderPoint: item.reorder_point,
  recommendedQuantity: calculateReorderQuantity(item),
}));

// Send to chat
await sendChatMessage(
  `🚨 Low Stock Alert!\n\n${recommendations.map(r => 
    `• ${r.variantName}: ${r.currentStock} units remaining (recommend ordering ${r.recommendedQuantity})`
  ).join('\n')}`
);
```

---

## 📁 File Structure

```
src/
├── lib/
│   └── katana/
│       ├── types.ts                    # All TypeScript types
│       ├── client.ts                   # API client
│       ├── utils/                      # Utilities
│       │   ├── rate-limiter.ts
│       │   ├── retry.ts
│       │   └── webhook-verifier.ts
│       ├── services/                   # Service layer
│       │   ├── manufacturing.service.ts
│       │   ├── inventory.service.ts
│       │   ├── purchase.service.ts
│       │   ├── sales.service.ts
│       │   └── transfer.service.ts
│       ├── commands/                   # Command implementations
│       │   ├── cook.command.ts
│       │   ├── label.command.ts
│       │   ├── pack.command.ts
│       │   ├── ship.command.ts
│       │   └── receive.command.ts
│       ├── mongodb/                    # Database models
│       │   └── models.ts
│       └── webhooks/                   # Webhook processing
│           └── processor.ts
└── app/
    └── api/
        ├── commands/                   # Command endpoints
        │   ├── cook/route.ts
        │   ├── label/route.ts
        │   ├── pack/route.ts
        │   ├── ship/route.ts
        │   └── receive/route.ts
        └── webhooks/
            └── katana/route.ts         # Webhook receiver
```

---

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test API connection
curl https://api.katanamrp.com/v1/manufacturing_orders \
  -H "Authorization: Bearer 91cecadd-5ac5-4f39-a312-65a566454700"
```

### Webhook Not Received

1. Check Vercel logs: `vercel logs --prod`
2. Verify webhook URL is correct
3. Check signature secret matches
4. Test with Postman/Insomnia

### MongoDB Connection Failed

```bash
# Test MongoDB connection
mongosh "your_mongodb_connection_string"
```

---

## 📚 Additional Resources

- [Katana API Documentation](https://developer.katanamrp.com/reference/api-introduction)
- [Full Testing Guide](./KATANA_TESTING_GUIDE.md)
- [Production System Documentation](./PRODUCTION_SYSTEM.md)
- [Integration Status](./KATANA_INTEGRATION_STATUS.md)

---

**Ready to go!** 🎉 Your Katana integration is set up and ready to use.

For questions or issues, check the testing guide or contact your development team.




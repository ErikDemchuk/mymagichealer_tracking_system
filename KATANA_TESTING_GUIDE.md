# Katana API Integration - Testing Guide

## Manual Testing Checklist

### ✅ Step 1: Environment Setup

- [ ] Copy `env.katana.example` to `.env.local`
- [ ] Add your Katana API key: `KATANA_API_KEY=91cecadd-5ac5-4f39-a312-65a566454700`
- [ ] Set MongoDB URI
- [ ] Set webhook secret (generate random string)
- [ ] Set application URL

### ✅ Step 2: Connection Test

**Test the Katana API connection:**

```bash
# Start dev server
npm run dev

# In browser console or API client (Postman/Insomnia):
fetch('/api/test-katana-connection')
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully connected to Katana API",
  "remainingRequests": 100
}
```

### ✅ Step 3: Test Manufacturing Order Retrieval

**Get list of manufacturing orders:**

```javascript
// In browser console:
const response = await fetch('/api/katana/manufacturing-orders');
const data = await response.json();
console.log(data);
```

**Expected:** List of MOs from your Katana account

### ✅ Step 4: Test Cook Command

**POST to /api/commands/cook:**

```json
{
  "manufacturingOrderId": "YOUR_MO_ID",
  "batchNumber": "TEST-BATCH-001",
  "actualQuantity": 857,
  "crateId": "CRATE-047",
  "location": "A-12-3",
  "startTime": "2025-11-02T08:30:00Z",
  "endTime": "2025-11-02T11:45:00Z",
  "notes": "Test cooking operation"
}
```

**Expected Response:**
```json
{
  "success": true,
  "taskId": "COOK-1730556789123",
  "moId": "YOUR_MO_ID",
  "batchNumber": "TEST-BATCH-001",
  "message": "Successfully recorded cooking...",
  "data": {
    "durationMinutes": 195,
    "ingredientsConsumed": 8,
    "nextStage": "labeling"
  }
}
```

**Verify in Katana:**
- [ ] MO status updated
- [ ] Operation marked complete
- [ ] Ingredients consumed recorded

### ✅ Step 5: Test Label Command

**POST to /api/commands/label:**

```json
{
  "manufacturingOrderId": "YOUR_MO_ID",
  "batchNumber": "TEST-BATCH-001",
  "sourceCrateId": "CRATE-047",
  "sourceLocation": "A-12-3",
  "destinationCrateId": "CRATE-108",
  "destinationLocation": "B-05-2",
  "quantityLabeled": 857,
  "startTime": "2025-11-02T13:15:00Z",
  "endTime": "2025-11-02T15:45:00Z"
}
```

**Expected:** Success response with duration metrics

**Verify in Katana:**
- [ ] Stock transfer created
- [ ] Labeling operation complete
- [ ] Location updated

### ✅ Step 6: Test Pack Command

**POST to /api/commands/pack:**

```json
{
  "manufacturingOrderId": "YOUR_MO_ID",
  "batchNumber": "TEST-BATCH-001",
  "sourceCrateId": "CRATE-108",
  "productSize": "2oz",
  "retailBoxesPacked": 857,
  "ulineBoxesUsed": 8,
  "guidelinesUsed": 857,
  "destination": "fba",
  "packedBy": "John Doe"
}
```

**Expected:** MO finalized, inventory updated

**Verify in Katana:**
- [ ] MO marked as complete
- [ ] Finished goods added to inventory
- [ ] Packing materials deducted

### ✅ Step 7: Test Ship Command (FBA)

**POST to /api/commands/ship:**

```json
{
  "shipmentType": "fba",
  "orders": [
    {
      "orderId": "SO_ID_1",
      "batchNumber": "TEST-BATCH-001",
      "quantity": 857
    }
  ],
  "trackingNumbers": ["1Z999AA10123456784"],
  "carrier": "UPS Freight",
  "shipDate": "2025-11-02T17:30:00Z",
  "palletId": "FBA-PALLET-2025-328"
}
```

**Expected:** Fulfillment created, inventory reduced

### ✅ Step 8: Test Receive Command (with Photo)

**POST to /api/commands/receive:**

```json
{
  "purchaseOrderId": "YOUR_PO_ID",
  "items": [
    {
      "variantId": "D-OIL",
      "quantityReceived": 450,
      "batchNumber": "2501030626"
    }
  ],
  "receivedDate": "2025-11-02T10:00:00Z",
  "photoBase64": "optional_base64_string",
  "notes": "Test receiving"
}
```

**Expected:** PO received, inventory updated

**Verify in Katana:**
- [ ] PO marked as received
- [ ] Inventory levels increased
- [ ] Batch numbers recorded

### ✅ Step 9: Test Webhook Endpoint

**1. Configure webhook in Katana:**
- URL: `https://your-app.vercel.app/api/webhooks/katana`
- Events: Select all manufacturing and inventory events
- Secret: Your `WEBHOOK_SECRET` value

**2. Trigger event in Katana:**
- Create a new manufacturing order
- Check logs for webhook receipt

**3. Verify webhook processing:**

```bash
# Check MongoDB for event
# Should see event with status 'processed'
```

**Expected:**
- [ ] Webhook received (200 OK)
- [ ] Event stored in MongoDB
- [ ] Event processed successfully
- [ ] Task auto-created (for MO events)

### ✅ Step 10: Test Inventory Sync

**GET /api/dashboard/inventory:**

```javascript
const response = await fetch('/api/dashboard/inventory');
const data = await response.json();
console.log(data);
```

**Expected:** Current inventory levels from cache

### ✅ Step 11: Test Low Stock Detection

**Run AI purchase recommender:**

```javascript
const response = await fetch('/api/katana/purchase-recommendations');
const recommendations = await response.json();
console.log(recommendations);
```

**Expected:** List of items needing reorder with recommendations

### ✅ Step 12: Test Error Handling

**Test with invalid data:**

```json
{
  "manufacturingOrderId": "INVALID_ID",
  "batchNumber": ""
}
```

**Expected:**
- [ ] 400 Bad Request
- [ ] Clear error messages
- [ ] No data corruption

---

## Automated Tests (To Implement)

### Unit Tests

```typescript
// __tests__/katana/services/manufacturing.test.ts
import { getManufacturingService } from '@/lib/katana/services';

describe('ManufacturingService', () => {
  it('should create manufacturing order', async () => {
    const service = getManufacturingService();
    // Mock API responses
    // Test service methods
  });
});
```

### Integration Tests

```typescript
// __tests__/katana/commands/cook.test.ts
import { executeCookCommand } from '@/lib/katana/commands';

describe('Cook Command', () => {
  it('should complete cook operation', async () => {
    // Test full cook workflow
  });
});
```

---

## Performance Tests

### Rate Limiting Test

```javascript
// Send 150 requests rapidly
const promises = [];
for (let i = 0; i < 150; i++) {
  promises.push(fetch('/api/katana/manufacturing-orders'));
}

const results = await Promise.allSettled(promises);
// Should see rate limiting kick in around 100 requests
```

### Webhook Load Test

```bash
# Send multiple webhook events simultaneously
for i in {1..10}; do
  curl -X POST https://your-app.vercel.app/api/webhooks/katana \
    -H "Content-Type: application/json" \
    -H "x-katana-signature: test_signature" \
    -d @webhook-payload.json &
done
```

---

## Monitoring Checklist

- [ ] Check Vercel logs for errors
- [ ] Monitor MongoDB event collection
- [ ] Check Katana API rate limit usage
- [ ] Verify webhook delivery success rate
- [ ] Monitor task completion rates

---

## Common Issues & Solutions

### Issue: "Katana API key is required"
**Solution:** Check `.env.local` has `KATANA_API_KEY` set

### Issue: "Webhook signature verification failed"
**Solution:** Ensure `WEBHOOK_SECRET` matches Katana webhook configuration

### Issue: "Rate limit exceeded"
**Solution:** Rate limiter will automatically wait. Check if too many concurrent requests.

### Issue: "Manufacturing order not found"
**Solution:** Verify MO exists in Katana and ID is correct

### Issue: "MongoDB connection failed"
**Solution:** Check `MONGODB_URI` is correct and MongoDB is accessible

---

## Success Criteria

✅ **All tests passing**
✅ **No errors in Vercel logs**
✅ **Webhooks processing within 1 second**
✅ **API response times < 2 seconds**
✅ **100% webhook delivery success rate**
✅ **Zero data corruption**
✅ **Accurate inventory tracking**

---

## Next Steps

1. **Run all manual tests** in checklist
2. **Fix any issues** found
3. **Implement automated tests**
4. **Set up monitoring alerts**
5. **Deploy to production**
6. **Configure Katana webhooks**
7. **Train team on new system**

---

**Last Updated:** November 2, 2025
**Integration Version:** 1.0
**Status:** Ready for Testing


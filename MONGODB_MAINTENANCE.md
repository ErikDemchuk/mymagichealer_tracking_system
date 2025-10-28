# 🗄️ MongoDB Maintenance Guide

## ✅ Current Setup (Already Working)

Your MongoDB is properly configured with:
- **Free Plan (M0)**: 512 MB storage, shared cluster
- **Database**: `test`
- **Collection**: `chats`
- **Indexes**: userId + updatedAt for fast queries
- **Connection**: Vercel Integration (automatic)

---

## 📊 Free Plan Limits

| Resource | Limit | Your Usage |
|----------|-------|------------|
| Storage | 512 MB | 36 KB (0.007%) |
| Estimated Chats | 100,000 - 250,000 | 2 |
| Bandwidth | Shared | Minimal |
| Retention | Forever | ∞ |
| Backups | Manual | None |

**Verdict: You're good for YEARS of normal usage**

---

## 🛡️ Recommended Maintenance Tasks

### 1. **Enable Backups (Optional but Recommended)**

**Option A: Manual Export (Free)**
- Go to MongoDB Atlas → Data Explorer
- Click "Export Collection"
- Download JSON once a month
- Store locally or in cloud storage

**Option B: Automated Backups ($9/month)**
- Upgrade to M10 cluster
- Get automated point-in-time recovery
- Only needed if data is mission-critical

### 2. **Monitor Storage Usage**

Check monthly:
- MongoDB Atlas → Cluster Metrics
- If you reach 400 MB (80%), consider:
  - Deleting old chats (add auto-cleanup)
  - Upgrading to M10 ($9/month with 10GB)

### 3. **Set Up Alerts (Free)**

MongoDB Atlas → Alerts:
- Storage usage > 80%
- Connection failures
- Slow queries

### 4. **Database Indexes (Already Set)**

Your app has these indexes:
```javascript
userId + updatedAt // Fast chat retrieval
```

**No action needed** - These are optimal.

### 5. **Data Retention Policy (Optional)**

If you want to auto-delete old chats:

**Add to your codebase (future enhancement):**
```javascript
// Delete chats older than 90 days
// Run this as a cron job (monthly)
await Chat.deleteMany({
  updatedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})
```

---

## 🔒 Security Best Practices

### Already Implemented ✅
- [x] Environment variables for connection string
- [x] User authentication (Google OAuth)
- [x] Session-based access control
- [x] Each user can only access their own chats

### Optional Enhancements:
- [ ] Add rate limiting (prevent spam)
- [ ] Add input validation (prevent malicious data)
- [ ] Enable MongoDB IP whitelist (restrict access)

---

## 📈 When to Upgrade

**Stay on Free Plan if:**
- < 10,000 chats
- < 100 concurrent users
- < 512 MB storage
- Don't need automated backups

**Upgrade to M10 ($9/month) when:**
- > 10,000 chats
- > 100 concurrent users
- Need automated backups
- Need dedicated resources

**Upgrade to M20+ ($49+/month) when:**
- Thousands of concurrent users
- Mission-critical production app
- Need advanced security features

---

## 🗂️ Data Organization

### Current Structure (Optimal)

```
Database: test
└─ Collection: chats
   └─ Documents (Chats)
      ├─ _id: UUID string
      ├─ userId: Google user ID
      ├─ title: Chat title
      ├─ messages: Array of message objects
      ├─ createdAt: ISO timestamp
      └─ updatedAt: ISO timestamp
```

### Why This Works:
1. **One collection** = Simple queries
2. **Embedded messages** = Fast retrieval (no joins)
3. **Indexed userId** = Quick user-specific queries
4. **UUID _ids** = Client-side generation, no conflicts

### No Changes Needed! ✅

---

## 🧪 Monitoring Your Database

### Daily (Automated via your app):
- Connection health check: `/api/test-mongodb`
- Error logs in Vercel dashboard

### Weekly:
- Check MongoDB Atlas dashboard
- Review storage usage
- Check for slow queries

### Monthly:
- Export backup (JSON)
- Review user growth
- Plan capacity if needed

### Yearly:
- Review pricing plans
- Optimize queries if needed
- Archive old data if needed

---

## 💾 Backup Strategy

### Recommended Approach:

**For Free Plan:**
1. **Manual exports** once a month
2. Store in Google Drive or Dropbox
3. Keep last 3 months of backups

**Script to export (run locally):**
```bash
# Install MongoDB tools
# Then export:
mongoexport --uri="your-connection-string" --collection=chats --out=backup-2025-01.json
```

**When to restore:**
- Accidental deletion
- Data corruption
- Migration to new cluster

---

## 🚨 Common Issues & Solutions

### Issue: "Connection refused"
**Solution:** Check IP whitelist in MongoDB Atlas
- Network Access → Add IP: `0.0.0.0/0`

### Issue: "Storage full"
**Solution:** Delete old chats or upgrade
```javascript
// Delete chats older than 90 days
await Chat.deleteMany({
  updatedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})
```

### Issue: "Slow queries"
**Solution:** Check indexes
```javascript
// Your indexes are already optimal
// If needed, add more:
ChatSchema.index({ 'messages.timestamp': -1 })
```

### Issue: "Lost data"
**Solution:** Restore from backup
```bash
mongoimport --uri="your-connection-string" --collection=chats --file=backup-2025-01.json
```

---

## 📊 Your Current Status

| Check | Status |
|-------|--------|
| MongoDB Connected | ✅ Working |
| Data Persisting | ✅ Yes |
| Indexes Set | ✅ Optimized |
| Storage Used | ✅ 0.007% |
| Session Working | ✅ Yes |
| Google Auth | ✅ Working |
| Chat CRUD | ✅ All working |

---

## 🎯 Action Items (Optional)

**Now:**
- [x] Everything is working!

**This Month:**
- [ ] Set up storage alert (80% threshold)
- [ ] Export first manual backup

**This Year:**
- [ ] Review storage usage quarterly
- [ ] Consider upgrading if > 100 users

**Never (unless needed):**
- Indexes are optimal
- Structure is good
- No optimization needed yet

---

## 📚 Resources

- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Free Tier Limits](https://www.mongodb.com/pricing)
- [Backup Guide](https://www.mongodb.com/docs/atlas/backup/)
- [Security Best Practices](https://www.mongodb.com/docs/atlas/security/)
- Your test endpoint: `https://nicareplus.com/api/test-mongodb`

---

## 🎉 Summary

**Your setup is production-ready!**

- ✅ Database connected and working
- ✅ Data persists correctly
- ✅ Optimized for performance
- ✅ Free plan will last years
- ✅ No maintenance needed now

**Next steps: Just use it!** Monitor monthly and backup occasionally.


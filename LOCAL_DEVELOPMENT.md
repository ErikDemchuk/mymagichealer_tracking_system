# 🔧 Local Development Setup

## ✅ Avatars Deployed!

Check https://nicareplus.com in ~2 minutes to see unique user avatars!

---

## 🖥️ Local Development (Safe Way)

### **Strategy: Separate Branch for UI Experiments**

This keeps your production (`master` branch) safe while you experiment locally!

---

## 📋 **Setup Steps:**

### 1. **Create a Development Branch**
```bash
# Create and switch to a new branch for UI work
git checkout -b ui-improvements

# Now you're on a separate branch, master is safe!
```

### 2. **Install Dependencies (if not already)**
```bash
npm install
```

### 3. **Start Local Server**
```bash
npm run dev
```

This will start at: **http://localhost:3000**

### 4. **See Changes INSTANTLY**
- Edit any file in your IDE
- Save the file
- Browser auto-refreshes with changes!
- No need to redeploy to Vercel

---

## 🛡️ **How This Keeps Production Safe:**

```
master branch (production)
    ↓ deployed to → https://nicareplus.com ✅ SAFE
    
ui-improvements branch (local)
    ↓ runs on → http://localhost:3000 🔧 EXPERIMENTS
```

**Changes on `ui-improvements` branch:**
- ❌ Don't affect production
- ✅ Only on your computer
- ✅ Can test everything locally
- ✅ Only deploy when you're happy with them

---

## 🔄 **Local Development Workflow:**

### **Making UI Changes:**

1. **Edit files** (any component, CSS, etc.)
2. **Save** (Ctrl + S)
3. **Browser auto-refreshes** - See changes instantly!
4. **Repeat** until you're happy

### **When Happy with Changes:**

```bash
# Commit on your ui-improvements branch
git add .
git commit -m "UI: Better styling for chat interface"

# Push to your branch (not master)
git push origin ui-improvements
```

### **To Deploy to Production:**

```bash
# Switch back to master
git checkout master

# Merge your UI changes
git merge ui-improvements

# Push to deploy
git push origin master
```

---

## 🔑 **Environment Variables for Local:**

Your `.env.local` should have:

```env
STORAGE_MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
SESSION_PASSWORD=...
NODE_ENV=development
```

**Already set?** Check if `.env.local` exists in your project root.

---

## 🎯 **Quick Command Reference:**

```bash
# Start local development
npm run dev

# Stop server (in terminal)
Ctrl + C

# Check which branch you're on
git branch

# Switch to master (production)
git checkout master

# Switch to development branch
git checkout ui-improvements

# See what changed
git status
```

---

## ✨ **Benefits:**

1. ✅ **Instant feedback** - See changes immediately
2. ✅ **Safe experiments** - Production stays untouched
3. ✅ **Fast iteration** - No waiting for Vercel deployments
4. ✅ **Full features** - MongoDB, Google auth, everything works
5. ✅ **Easy rollback** - Just don't merge if you don't like changes

---

## 🚨 **Important Notes:**

### **Local uses SAME database as production:**
- MongoDB: Same data
- Chats you create locally appear in production
- Other users see them too

**Want a separate test database?**
- Create another MongoDB cluster
- Use different connection string in `.env.local`

### **Google OAuth:**
- May need to add `http://localhost:3000` to Google OAuth settings
- Or test with existing session (login on production first)

---

## 🎨 **What to Work On Next:**

Some UI improvement ideas:
- [ ] Better chat layout/spacing
- [ ] Improved sidebar design
- [ ] Dark mode
- [ ] Better message bubbles
- [ ] Loading animations
- [ ] Better mobile responsiveness
- [ ] Custom fonts/colors

---

## 📞 **Need Help?**

Just ask and I'll help with:
- Setting up local environment
- Creating branches
- Merging changes
- Any UI improvements you want to make

---

**Ready to start? Run these commands:**

```bash
# 1. Create UI branch
git checkout -b ui-improvements

# 2. Start local server
npm run dev

# 3. Open http://localhost:3000 in browser
```

Then start editing and see changes instantly! 🚀



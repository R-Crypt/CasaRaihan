# Quick Start Guide - Casa Raihan Homestay

## Current Status
✅ Backend code is ready
✅ Frontend code is ready
❌ PostgreSQL database needs to be set up

## Next Steps

### Step 1: Set Up PostgreSQL Database

You have **3 options**. Choose ONE:

#### **Option A: Supabase (Recommended - Easiest)**
1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
3. Fill in:
   - Project name: `casaraihancoorg`
   - Database password: (create a strong password and save it)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)
5. Go to Settings → Database
6. Copy the "Connection String" (URI format)
7. Edit `backend/.env` and replace the DATABASE_URL line with your connection string
8. Continue to Step 2 below

#### **Option B: Install PostgreSQL Locally (Mac)**
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL
brew services start postgresql@16

# Create database
createdb casaraihancoorg

# Update backend/.env with:
# DATABASE_URL="postgresql://$(whoami)@localhost:5432/casaraihancoorg?schema=public"
```

#### **Option C: Docker**
```bash
docker run --name casaraihan-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=casaraihancoorg \
  -p 5432:5432 \
  -d postgres:16

# Update backend/.env with:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/casaraihancoorg?schema=public"
```

---

### Step 2: Run Database Migrations

**IMPORTANT: Make sure you're in the backend directory!**

```bash
# Navigate to backend directory
cd /Users/rayaankhan/Desktop/casaraihancoorg/backend

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run db:seed
```

You should see:
- ✅ Created admin user: admin@casaraihan.com
- ✅ Created rooms

---

### Step 3: Start Backend Server

```bash
# Still in backend directory
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
```

**Keep this terminal window open!**

---

### Step 4: Start Frontend (New Terminal Window)

Open a **NEW terminal window** and run:

```bash
# Navigate to project root
cd /Users/rayaankhan/Desktop/casaraihancoorg

# Start frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

---

### Step 5: Access the Application

Open your browser and go to: **http://localhost:5173**

**Admin Login:**
- Email: `admin@casaraihan.com`
- Password: `admin123`

---

## Troubleshooting

### "Can't reach database server"
- Make sure you completed Step 1 (PostgreSQL setup)
- Verify your DATABASE_URL in `backend/.env` is correct
- If using local PostgreSQL, check it's running: `brew services list`

### "Missing script: dev"
- Make sure you're in the correct directory
- Backend commands run from: `/Users/rayaankhan/Desktop/casaraihancoorg/backend`
- Frontend commands run from: `/Users/rayaankhan/Desktop/casaraihancoorg`

### "Port already in use"
- Backend (3000): `lsof -ti:3000 | xargs kill`
- Frontend (5173): `lsof -ti:5173 | xargs kill`

---

## Summary

**Two terminal windows needed:**

**Terminal 1 - Backend:**
```bash
cd /Users/rayaankhan/Desktop/casaraihancoorg/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/rayaankhan/Desktop/casaraihancoorg
npm run dev
```

**Then open:** http://localhost:5173

---

**Need help? Check:**
- Full setup guide: `README.md` in project root
- PostgreSQL setup: `backend/POSTGRES_SETUP.md`
- Migration details: `walkthrough.md` in artifacts

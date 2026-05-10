# Casa Raihan Homestay - Complete Setup Guide

This guide will help you set up and run the Casa Raihan Homestay booking website with your custom backend API (migrated from Base44).

## Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** database installed and running
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## Project Structure

```
casaraihancoorg/
├── backend/              # Node.js/Express API server
│   ├── src/
│   ├── prisma/
│   └── package.json
├── src/                  # React frontend
├── package.json
└── README.md
```

## Step-by-Step Setup

### 1. Backend Setup

#### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

#### 1.2 Configure Backend Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/casaraihancoorg?schema=public"

# JWT Secrets - IMPORTANT: Change these to secure random strings
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Server Configuration
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Email Configuration (for booking notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
EMAIL_FROM="Casa Raihan Homestay <noreply@casaraihan.com>"
```

**Email Setup Notes:**
- For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833)
- Alternatively, use SendGrid, AWS SES, or another email service

#### 1.3 Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Seed database with sample data (admin user + rooms)
npm run db:seed
```

**Default Admin Credentials:**
- Email: `admin@casaraihan.com`
- Password: `admin123`

#### 1.4 Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Backend will run at `http://localhost:3000`

### 2. Frontend Setup

#### 2.1 Install Frontend Dependencies

```bash
# From project root
cd ..  # if you're in backend directory
npm install
```

#### 2.2 Configure Frontend Environment

The `.env` file has already been created with:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Note:** When deploying to production, update this to your production API URL.

#### 2.3 Start Frontend Development Server

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

### 3. Access the Application

1. **Open your browser** and navigate to `http://localhost:5173`
2. **Homepage** will load with room previews
3. **Login as admin** using the credentials above to access admin dashboard
4. **Create a user account** to test booking flow

## Key Features

### For Guests
- Browse available rooms
- View room details and pricing
- Select dates and check availability
- Create bookings (requires login/registration)
- View and cancel bookings from profile

### For Admins
- Manage rooms (create, edit, delete)
- Upload room images
- View all bookings
- Update booking status
- Block dates for maintenance/renovation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking

### Blocked Dates
- `GET /api/blocked-dates` - List blocked dates
- `POST /api/blocked-dates` - Create blocked date (admin only)
- `DELETE /api/blocked-dates/:id` - Delete blocked date (admin only)

## Troubleshooting

### Backend Issues

**Database Connection Error**
```
Error: Can't reach database server
```
- Ensure PostgreSQL is running: `brew services start postgresql` (Mac) or `sudo service postgresql start` (Linux)
- Verify DATABASE_URL in `backend/.env`
- Check PostgreSQL user permissions

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
- Change PORT in `backend/.env` to a different port (e.g., 3001)
- Or kill the process: `lsof -ti:3000 | xargs kill`

**Email Not Sending**
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail, ensure you're using an App Password
- Check spam folder for test emails

### Frontend Issues

**API Connection Error**
```
Network Error / CORS Error
```
- Ensure backend server is running on port 3000
- Verify VITE_API_BASE_URL in `.env` matches backend URL
- Check CORS configuration in `backend/src/server.js`

**Authentication Not Working**
- Clear browser localStorage: Open DevTools → Application → Local Storage → Clear
- Check that JWT tokens are being saved in localStorage
- Verify backend JWT_SECRET is set

## Database Management

```bash
cd backend

# Open Prisma Studio (GUI for database)
npm run db:studio

# Create a new migration after schema changes
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Production Deployment

### Backend Deployment (Railway/Render/Fly.io)

1. Set environment variables in your hosting platform
2. Set `NODE_ENV=production`
3. Use a production PostgreSQL database (e.g., Supabase, PlanetScale)
4. Update FRONTEND_URL to your production frontend URL
5. Set secure JWT secrets

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Set `VITE_API_BASE_URL` to your production backend URL
3. Deploy the `dist` folder

## Migration from Base44

✅ **Completed:**
- Replaced Base44 SDK with custom Express API
- Implemented JWT authentication
- Created PostgreSQL database with Prisma
- Implemented all CRUD operations
- Added file upload for room images
- Added email notifications for bookings
- Removed @base44/sdk dependency

**No Base44 services are required anymore!** The application now runs completely independently.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: Check terminal where backend is running
3. Review frontend logs: Open browser DevTools → Console
4. Check database: `npm run db:studio` in backend directory

## Next Steps

1. **Customize branding**: Update colors, logos, and text in frontend
2. **Add payment integration**: Integrate Stripe/Razorpay for online payments
3. **Add more features**: Reviews, ratings, photo galleries
4. **Set up monitoring**: Add error tracking (Sentry) and analytics
5. **Configure backups**: Set up automated database backups

---

**Congratulations!** Your homestay booking website is now running with a custom backend API. 🎉
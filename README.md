# Citizen Complaint Portal — Municipal Operations System

A civic-tech monorepo web application enabling citizens to report local infrastructure issues (roads, garbage, water, electricity) and track resolution, while empowering government officers with real-time triage signals, AI dispatch briefings, and CSV export tools.

---

## Repository Structure

```
├── server/             # Express.js REST API + MongoDB (Mongoose) + Cloudinary
│   ├── src/
│   │   ├── config/     # Database connection & MongoMemoryServer fallback
│   │   ├── controllers/# Auth, Complaint, AI Briefing controllers
│   │   ├── middleware/ # JWT Auth & Multer upload middleware
│   │   ├── models/     # User and Complaint mongoose schemas
│   │   ├── routes/     # Express route definitions
│   │   ├── utils/      # Cloudinary upload helper & seed logic
│   │   ├── seed.js     # Database seeder (9 sample tickets & demo accounts)
│   │   └── server.js   # Main Express application entrypoint
│   └── .env            # Environment configuration
└── client/             # Next.js App Router + Tailwind CSS + Lucide Icons
    ├── app/            # App Router pages (Citizen & Officer dashboards)
    ├── components/     # TransitStepper, PriorityBadge, CategoryIcon, Navbar
    ├── context/        # AuthContext for JWT session management
    └── lib/            # Centralized API fetch service
```

---

## Cloudinary Image Upload Setup

This application uses **Cloudinary** for storing uploaded complaint verification photos in the cloud.

### 1. Cloudinary Credentials
Add your Cloudinary credentials to `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# OR via Cloudinary URL string:
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

### 2. Automatic Local Fallback
If Cloudinary credentials are not set in `.env`, the server automatically saves uploaded files to the local `/server/uploads` directory seamlessly.

---

## Quick Start Guide

### 1. Start the Backend API Server
```bash
cd server
npm install
npm run start
```
*The server runs on `http://localhost:5000`. If local MongoDB is not running, it automatically initializes `MongoMemoryServer` and seeds 9 demo complaints & accounts.*

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
*The client runs on `http://localhost:3000`.*

---

## Demo Credentials

- **Demo Officer**: `officer@demo.gov` / `officer123`
- **Demo Citizen**: `citizen@demo.gov` / `citizen123`

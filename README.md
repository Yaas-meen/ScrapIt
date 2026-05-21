# ScrapIt — Recycling Pickup Scheduling Platform

> Turn waste into worth. Schedule collections, earn points, redeem airtime and gift cards.

---

## Team

| Dev | Role |
|-----|------|
| Dev A | Backend core — models, services, controllers, tests |
| Dev B | Auth/DevOps — deployment, CI, token refresh |
| Dev C | User portal — dashboard, schedule, pickups, rewards |
| Dev D | Admin/Collector portals — layouts, stores, contracts |

---

## Tech stack
---

## Live URLs

| Environment | URL |
|-------------|-----|
| Client (Vercel) | https://scrapit.vercel.app |
| Server (Railway)| https://scrapit-server-production.up.railway.app |
| Health check    | https://scrapit-server-production.up.railway.app/health |

---

## Local setup

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1 — Clone and install

```bash
git clone https://github.com/your-org/scrapit.git
cd scrapit

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 2 — Server environment variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/scrapit

JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

### 3 — Client environment variables

`client/.env` (already in repo):

```env
VITE_API_BASE_URL=/api/v1
VITE_USE_MOCK=true
VITE_APP_NAME=ScrapIt
```

Set `VITE_USE_MOCK=false` to use the real backend.

### 4 — Start development servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open: http://localhost:5173

---

## Seed data

```bash
# Seed admin user (admin@scrapit.com / Admin@1234)
cd server && npm run seed:admin

# Seed full demo data (users, collectors, pickups, rewards, notifications)
cd server && npm run seed:data
```

### Test credentials

| Portal | Email | Password |
|--------|-------|----------|
| User | chidi@gmail.com | password123 |
| Admin | admin@scrapit.com | Admin@1234 |
| Collector | emeka@scrapit.com | collector123 |

---

## Running tests

```bash
# Backend integration tests
cd server && npm test

# Frontend unit + component tests
cd client && npm test

# Frontend with coverage
cd client && npm run test:coverage
```

---

## Project structure

---

## API summary

Full documentation: [`API_CONTRACTS.md`](./API_CONTRACTS.md)

Base URL: `/api/v1`

| Group | Endpoints |
|-------|-----------|
| Auth | register, login (user/admin/collector), refresh, logout, /me |
| Users | profile, update profile, change password, list (admin) |
| Pickups | create, list mine, list all, update status, assign, delete |
| Rewards | redeem, list mine, reveal code, list all |
| Notifications | list mine, mark read, mark all read, delete |
| Collectors | list, create, toggle status, profile |
| Admin | dashboard stats, charts, activity log, user summary |

---

## Deployment

### Railway (server)

1. Connect GitHub repo → set root directory to `server/`
2. Set all environment variables from `server/.env` (use production values)
3. MongoDB Atlas → Network Access → allow `0.0.0.0/0` for Railway IPs
4. First deploy runs automatically on push to `main`

### Vercel (client)

1. Connect GitHub repo → set root directory to `client/`
2. Set `VITE_API_BASE_URL` to your Railway URL + `/api/v1`
3. Set `VITE_USE_MOCK=false`
4. Deploy

### Post-deploy checklist
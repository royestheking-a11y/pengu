## Deployment & Production (Render + Vercel)

The platform is designed to run with a **Vercel** frontend and a **Render** backend.

### 1. Backend (Render) Configuration
To ensure the backend stays active on Render's free tier, a **Keep-Alive** mechanism is implemented.

**Mandatory Environment Variable:**
- `RENDER_EXTERNAL_URL`: Your public Render service URL (e.g. `https://your-app.onrender.com`).
  - *Why?* This is used by the internal keep-alive logic to ping the server every 5 minutes and prevent it from sleeping.

**Other Required Variables:**
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secure string for auth tokens.
- `FRONTEND_URL`: Your production Vercel URL.
- `NODE_ENV`: Set to `production` to enable the Keep-Alive loop.

### 2. Frontend (Vercel) Configuration
**Environment Variables:**
- `VITE_API_BASE_URL`: Your Render API URL (e.g. `https://your-app.onrender.com/api`).
- `VITE_SOCKET_URL`: Your Render base URL (e.g. `https://your-app.onrender.com`).

---

## Technical Features
- **Auto-Keep-Alive**: Internal cron-like logic prevents server hibernation.
- **Unified API Routing**: Standardized Axios instance handles cross-origin requests.
- **Dynamic CORS**: Whitelists Vercel subdomains automatically.
  
# 🚀 Production Deployment & Hosting Guide
### Synapse AI — Decoupled Cloud Architecture (Frontend + Backend API + SQLite)

This guide provides exact step-by-step instructions for hosting your **React 19 Frontend on Vercel/Netlify** and your **Laravel 12 API Backend on Railway/Render/VPS** using an **SQLite** database.

---

## 🏗 Architecture Summary

| Component | Recommended Host | Production URL Example | Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | `https://synapse.ai` (or `https://synapse.vercel.app`) | Global Edge CDN, lightning-fast static assets, automatic HTTPS |
| **Backend API** | [Railway](https://railway.app), [Render](https://render.com), or VPS | `https://api.synapse.ai` (or `https://synapse-api.up.railway.app`) | Laravel 12 REST API, KHQR signed transactions, Admin authentication |
| **Database** | SQLite (Persistent Volume) | `/app/database/database.sqlite` | File-based zero-configuration database |

---

## ⚡ FASTEST & FREE: Host Everything as ONE Web Service on Render

Yes! You can host **both the Frontend and Backend API together on ONE single Render Web Service**.

### Why this is great:
- **100% Free or $7/mo**: You only run **one** service on Render.
- **Zero CORS issues**: The frontend UI and the `/api/...` endpoints live on the exact same domain (e.g. `https://synapse-ai.onrender.com`).
- **No environment variable hassle**: `VITE_API_BASE_URL` stays empty because all calls remain relative.

### Steps to Deploy on Render as ONE Service:
1. Log in to [render.com](https://render.com) and click **New +** → **Web Service**.
2. Select your GitHub repository.
3. Configure the settings:
   - **Name**: `synapse-ai`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or Starter)
4. Add Environment Variables (under **Advanced**):
   - `NODE_ENV`: `production`
5. Click **Create Web Service**!
   Render will build the React frontend with Vite into `dist/` and launch the API server, which automatically serves both the API routes and the React store on `https://your-service.onrender.com`.

---

## PART 1: Backend API Deployment (Laravel + SQLite)

### Option A: Deploy on Railway (Recommended & Easiest)
Railway automatically detects PHP/Laravel from your repository and provides automatic HTTPS.

1. **Create a Railway Account**: Sign in to [railway.app](https://railway.app) using GitHub.
2. **New Project**: Click **New Project** → **Deploy from GitHub repo** → select your repository.
3. **Set Root Directory**: In Railway settings for the service, set **Root Directory** to `/laravel-backend`.
4. **Add Persistent Volume (Critical for SQLite)**:
   - Go to your Railway service → **Settings** → **Volumes** → **Add Volume**.
   - Mount Path: `/app/database` (or `/var/www/html/database`).
   - This ensures your SQLite file (`database.sqlite`), user orders, and product catalog are permanently preserved across container redeploys.
5. **Configure Environment Variables**:
   In Railway **Variables**, add:
   ```ini
   APP_NAME="Synapse AI"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
   APP_KEY=base64:tI+CukW4j1yNn/VIDhozVu7apYVLaYsR1ZNGM6zsnw0=
   DB_CONNECTION=sqlite
   DB_DATABASE=/app/database/database.sqlite
   SESSION_DRIVER=file
   CACHE_STORE=file

   # Cambodia National KHQR Gateway Credentials
   KHQR_GATEWAY_URL=https://khqr.cc/api/payment/requestv2/tW6PHjgPyzISFi3KK22hKZ57rag1cWHS
   KHQR_PROFILE_ID=tW6PHjgPyzISFi3KK22hKZ57rag1cWHS
   KHQR_SECRET_KEY=zsFq7SWHV4gYFSAdfg2ud8WV747tBOei
   ```
6. **Deploy & Generate Domain**:
   - Railway builds and deploys your service.
   - Go to **Settings** → **Networking** → **Generate Domain** (e.g. `https://synapse-production.up.railway.app`).
7. **Run Database Migrations**:
   Open the Railway **CLI / Terminal** tab for your container and run:
   ```bash
   php artisan migrate --force
   ```

---

### Option B: Deploy on an Ubuntu VPS (DigitalOcean / Hetzner / AWS EC2)
If hosting Laravel on your own Linux server:

1. **Install PHP 8.2+ and SQLite extensions**:
   ```bash
   sudo apt update && sudo apt install -y php8.2-fpm php8.2-cli php8.2-sqlite3 php8.2-curl php8.2-mbstring php8.2-xml php8.2-zip unzip git composer
   ```
2. **Clone & Set Permissions**:
   ```bash
   cd /var/www/synapse-backend
   # Copy laravel-backend contents here
   sudo chown -R www-data:www-data /var/www/synapse-backend/storage /var/www/synapse-backend/bootstrap/cache /var/www/synapse-backend/database
   sudo chmod -R 775 /var/www/synapse-backend/storage /var/www/synapse-backend/bootstrap/cache /var/www/synapse-backend/database
   ```
3. **Configure `.env`**:
   Copy `.env.example` to `.env` and set `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY`, and KHQR keys.
4. **Optimize for Production**:
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---

## PART 2: Frontend Deployment (Vercel)

1. **Log in to Vercel**: Visit [vercel.com](https://vercel.com) and log in with GitHub.
2. **Import Project**:
   - Click **Add New...** → **Project**.
   - Select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Set Environment Variable (Links Frontend to Backend)**:
   Under **Environment Variables**, add:
   ```ini
   VITE_API_BASE_URL=https://your-backend-api-url.railway.app
   ```
   *(Replace with the actual live URL of your backend from Part 1, without trailing slash).*
5. **Click Deploy**:
   Vercel compiles the React application into optimized static assets. Within seconds, your site will be live at `https://your-project.vercel.app`!

---

## 🌐 How Cross-Origin API (CORS) Works

When the user opens your frontend (`https://your-app.vercel.app`), the browser sends requests to your backend (`https://your-backend-api.railway.app/api/...`).

1. **Frontend**: The centralized API utility (`src/utils/api.js`) automatically prefixes all requests with `VITE_API_BASE_URL`.
2. **Backend**: Laravel's `config/cors.php` is already configured with `'allowed_origins' => ['*']` and `'allowed_methods' => ['*']`, allowing your Vercel frontend to query the API with zero CORS blocks.

---

## 🛠 Production Verification Checklist

Once both services are deployed, test your live store:

- [ ] **Home Page Products**: Open `https://your-app.vercel.app` and confirm products load dynamically from the Laravel database.
- [ ] **Admin Login**:
  - Visit `/login` or click **Sign In**.
  - Login with `admin@synapse.ai` / `admin123`.
  - Confirm the **Admin Panel** opens and displays statistics, orders, and products.
- [ ] **KHQR Checkout**:
  - Add any AI tool to cart and click **Proceed to Checkout**.
  - On Step 2, confirm the **Cambodia National KHQR Gateway** renders with a dynamic scannable QR code and signed link.
  - Test completing the order and verifying license generation.
- [ ] **Page Refreshing (SPA Routing)**:
  - Visit any deep route or refresh the browser.
  - Thanks to `vercel.json` / `netlify.toml`, the application correctly serves `index.html` without 404 errors.

# Synapse AI — AI Tools & Subscription Platform

A premier full-stack platform for selling AI tools and subscriptions, integrated with **Laravel 12 Backend**, **SQLite / MySQL Database**, **Admin Panel for Products & Categories**, and **ABA PayWay Gateway**.

---

## 🏗 Architecture Overview

- **Frontend**: React 19 + Vite (`http://localhost:5173/`)
- **Backend**: Laravel 12 API (`http://127.0.0.1:8000/`)
- **Database**: SQLite (`laravel-backend/database/database.sqlite`) & fully compatible with MySQL via `.env`
- **Authentication**: Laravel Sanctum with Role-Based Access Control (`admin` / `user`)
- **Payment Gateway**: ABA PayWay & KHQR Direct Link (`https://link.payway.com.kh/ABAPAY9s540501U`)

---

## 🔑 Admin Credentials & Access

The Admin Panel is protected and hidden from the public navigation. It is only accessible to users with `role: "admin"`:

1. Click **Sign In** in the header or visit `/login` (or `#login`).
2. Log in with the default admin account:
   - **Email**: `admin@synapse.ai`
   - **Password**: `admin123`
3. The **Admin Panel** unlocks with real-time controls for **Products**, **Categories**, **Orders**, **Subscribers**, and **Settings**.

---

## 🛠 Features & Capabilities

### 1. Categories Management (`/api/categories`)
- Create, view, edit, and delete product categories.
- Assign custom theme colors (with quick swatches: Violet, Pink, Cyan, Emerald, Amber, Blue).
- Custom highlight badges and icons.
- Displays product count per category.

### 2. Products Management (`/api/products` & `/api/tools`)
- Full CRUD: Add, edit, delete, and view AI tools.
- Link each product to its respective category.
- Filter products by category dropdown and search term.
- Configure monthly pricing, lifetime license pricing, capabilities list, engine version, and status.

### 3. Database Schema (Laravel Migrations & Eloquent)
- `categories`: `id`, `name`, `slug`, `description`, `icon`, `color`, `badge`, `display_order`, `is_active`
- `products`: `id`, `name`, `slug`, `category_id`, `category_slug`, `badge`, `rating`, `reviews_count`, `short_desc`, `capabilities`, `price_monthly`, `price_lifetime`, `included_in_sub`, `status`
- `orders`: `id`, `order_number`, `customer_name`, `customer_email`, `company`, `items`, `amount`, `payment_method`, `aba_link`, `status`, `api_key`
- `subscribers`: `id`, `name`, `email`, `plan`, `tier`, `tokens_used`, `token_limit`, `status`, `renews_on`, `payment_method`
- `settings`: `id`, `key`, `value`
- `users`: `id`, `name`, `email`, `password`, `role`

### 4. ABA PayWay Gateway Integration
- **Direct PayWay Payment Link**: Configured in database as `https://link.payway.com.kh/ABAPAY9s540501U`.
- **Checkout Modal**:
  - Primary button: `Pay Now via ABA PAY ($588) ↗` opens PayWay directly.
  - Scannable QR code & clickable direct link with copy button.
  - License activation button upon completing payment.
  - Editable via Admin Settings tab.

---

## 🚀 Running the Project

### Start Laravel Backend
```bash
cd laravel-backend
php artisan serve --port=8000
```
Or from the project root:
```bash
npm run laravel
```

### Start Vite Frontend
```bash
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

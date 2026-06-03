# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marvel Steel is a full-stack e-commerce platform for steel/outdoor furniture. It has a FastAPI backend and a React frontend, containerized with Docker Compose backed by PostgreSQL.

## Commands

### Backend (run from `backend/`)

```bash
# Install dependencies
pip install -r requirements.txt

# Run dev server (requires DATABASE_URL env var)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Database migrations
alembic upgrade head                              # apply all migrations
alembic revision --autogenerate -m "description"  # generate new migration
alembic downgrade -1                              # roll back one migration
```

Alembic reads `DATABASE_URL` directly from `app.core.config.Settings` at runtime, so the URL in `alembic.ini` is ignored. Set `DATABASE_URL` in the environment before running any `alembic` command.

### Frontend (run from `frontend/`)

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build
```

`BASE_URL` in `frontend/src/App.jsx:4` is hardcoded to `https://marvelsteel1.com/api`. This value is the **nginx proxy prefix**, not a pure API base — the production nginx strips the `/api` segment before forwarding to the FastAPI backend. Public pages (LandingPage, Shop) call `${BASE_URL}/categories/` (legacy routes), while admin/cart/checkout pages call `${BASE_URL}/api/v1/...` which resolves correctly after nginx stripping. For **local development** (no nginx proxy), change `BASE_URL` to `http://localhost:8000` — without the `/api` suffix — otherwise admin and cart API calls will double the path segment. The `VITE_API_URL` build arg only applies to Docker builds, not `npm run dev`.

### Docker (run from repo root)

```bash
docker compose up --build    # build and start all services
docker compose up -d         # start detached
docker compose down          # stop
docker compose logs backend  # tail logs
```

The backend Dockerfile runs `alembic upgrade head` before starting Uvicorn, so migrations are applied automatically on container start.

## Environment Variables

Create a `.env` file at the repo root (used by Docker Compose and the backend):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL DSN, e.g. `postgresql://admin:secret@db:5432/marvel_steel` |
| `SECRET_KEY` | 256-bit random string for JWT signing |
| `POSTGRES_USER` | PostgreSQL username (Docker Compose only, default: `admin`) |
| `POSTGRES_PASSWORD` | PostgreSQL password (Docker Compose only, default: `secret123`) |
| `POSTGRES_DB` | PostgreSQL database name (Docker Compose only, default: `marvel_steel`) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (optional — notifications are skipped if absent) |
| `VITE_API_URL` | Base URL injected at Docker build time for the frontend, e.g. `http://localhost:8000` |

Note: `TELEGRAM_CHAT_ID` is **not read from the environment**. The two recipient chat IDs are hardcoded in `backend/app/utils/notifications.py:28-31`.

The backend defaults to `postgresql://admin:admin@localhost:5432/marvel_steel` if `DATABASE_URL` is not set.

## Architecture

### Backend (`backend/app/`)

Layered FastAPI application:

- **`core/`** — `config.py` (Pydantic Settings), `security.py` (JWT + bcrypt), `dependencies.py` (FastAPI deps: `get_db`, `get_current_admin`, `get_current_super_admin`)
- **`models/`** — SQLAlchemy ORM models: `Product`, `ProductImage`, `ProductSize`, `Category`, `Order`, `OrderItem`, `Cart`, `CartItem`, `Admin`, `SiteSettings`. The `Review` model lives in `site_settings.py`, not its own file.
- **`schemas/`** — Pydantic V2 request/response schemas mirroring the model layer
- **`services/`** — Business logic, one file per domain (`auth_service`, `product_service`, `checkout_service`, etc.). Routers call services; services call the DB directly via the `Session` passed in.
- **`routers/admin/`** — Protected routes requiring a valid JWT (`get_current_admin` or `get_current_super_admin` dependency). Covers auth, products, categories, orders, analytics, dashboard, reviews, settings, staff, and a temporary `migration` router.
- **`routers/public/`** — Unauthenticated routes for products, categories, cart, checkout, orders, and reviews.
- **`utils/notifications.py`** — Async Telegram notification sent as a `BackgroundTasks` job on order confirmation, so checkout is never blocked by it.

**API prefix:** All versioned routes are under `/api/v1/`. Legacy unversioned routes (`/products`, `/categories`, `/orders`, `/reviews`) are kept for backward compatibility with the deployed frontend.

**Static files:** Uploaded images are stored under `backend/uploads/` and served at `/uploads`. On cloud deploys with ephemeral filesystems (e.g. Render), a persistent disk must be mounted at `/app/uploads`.

**On startup:** If no admin exists in the database, a default super admin is created (`admin@marvelsteel.com` / `Admin123456`). Change this immediately in production.

**Admin roles:** `super_admin` (full access) and `admin` (standard). Role is checked via `get_current_super_admin` dependency for destructive endpoints.

**Cart identity:** Carts are anonymous and identified by a UUID stored client-side. The frontend sends it as the `x-cart-id` header on every cart/checkout request.

### Frontend (`frontend/src/`)

React 19 + React Router 7 SPA built with Vite and styled with Tailwind CSS v4. All API calls use **Axios**. Forms use **Formik + Yup**. The `vercel.json` rewrites all paths to `/index.html` for SPA routing on Vercel.

- **`App.jsx`** — Route tree with two layouts: `MainLayout` (public storefront) and `AdminLayout` (admin panel behind `AdminProtectedRoute`). `BASE_URL` is defined here and imported by all API callers.
- **`Components/Context/`** — Three React contexts wrapping the full app:
  - `CartContext` — manages cart state; persists the cart UUID in `localStorage`; sends `x-cart-id` on every request
  - `AdminContext` — stores admin JWT and profile; gates the admin panel
  - `LanguageContext` — i18n toggle (Arabic/English)
- **`Pages/Admin/`** — Full admin panel: Dashboard, Orders, Products, Categories, Staff, Reviews, Settings
- **`Pages/`** — Public storefront pages: Home, Shop, ProductDetails, Cart, Checkout, OrderSuccess, Contact, About

The frontend is deployed separately on Vercel. The production API base URL is `https://marvelsteel1.com/api`.

### Migrations (`backend/alembic/`)

Alembic migrations are in `alembic/versions/`. The initial schema migration (`0000_initial_schema.py`) creates all tables. The Dockerfile runs `alembic upgrade head` before starting Uvicorn.

All models must be imported in `alembic/env.py` for autogenerate to detect them.

## Testing

There is no test suite in this project. The `backend/test_pricing.py` file is a standalone one-off script, not a test framework setup.

## Key Notes

- The `admin_migration` router in `main.py` is marked `# TEMP: delete after production migration` — remove it once the WooCommerce data import is complete.
- `main.py` currently adds the CORS middleware twice with duplicate `app.add_middleware(CORSMiddleware, ...)` calls; both use `allow_origins=["*"]`. The `origins` list defined between them is unused.
- `ProductSize` holds all product variation attributes (bed size, metal color, slats type, cushion color, rope color, umbrella color) in a flat table — not all columns apply to every product category.

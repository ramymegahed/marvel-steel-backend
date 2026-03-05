# Marvel Steel Backend

**Marvel Steel** is a clean, modular, and scalable FastAPI backend MVP designed for a furniture e-commerce store (beds, tables, home furniture). It provides a secure Administrative Dashboard API alongside a fast, public-facing Customer interface for browsing products and placing orders.

---

## 🚀 Tech Stack

- **Python 3.11+**
- **FastAPI** (High-performance async web framework)
- **PostgreSQL** (Robust relational database)
- **SQLAlchemy ORM** (Database interaction)
- **Alembic** (Database schema migrations)
- **Pydantic V2** (Data validation and serialization)
- **Docker & Docker Compose** (Containerization and deployment)
- **Bcrypt & JWT** (Authentication & Security)

---

## 🌟 Key Features

- **Admin Dashboard Logic:** Full CRUD operations for managing Categories, Products, Sizes, and Product Images.
- **Order Processing:** Automated stock reduction when orders are `CONFIRMED`, and stock restoration if `CANCELLED`.
- **JWT Authentication:** Role-based access control protecting all administrative endpoints.
- **Image Uploads:** File management utility for saving product images locally.
- **Data Aggregation:** Dashboard endpoints for summarizing total orders, revenue, and product statistics.

---

## 📁 Project Structure

```text
marvel_steel/
│
├── alembic/                # Database migration scripts
├── app/
│   ├── core/               # Configuration and security dependencies
│   ├── models/             # SQLAlchemy Database Models (Tables)
│   ├── schemas/            # Pydantic Schemas (Validation)
│   ├── routers/            # API Endpoints
│   │   ├── admin/          # Protected Admin-only routes
│   │   └── public/         # Open Customer-facing routes
│   ├── services/           # Core Business Logic (CRUD & Processing)
│   ├── utils/              # Reusable helpers (Pagination, Uploads)
│   ├── database.py         # SQLAlchemy engine and session initialization
│   └── main.py             # FastAPI App instance and route inclusion
│
├── uploads/products/       # Local storage for uploaded product images
├── .env                    # Environment variables (Optional for local)
├── alembic.ini             # Alembic configuration
├── docker-compose.yml      # Infrastructure orchestration
├── Dockerfile              # Web service container definition
└── requirements.txt        # Python package dependencies
```

---

## 🛠️ Getting Started (Docker Way)

The application is fully containerized, making it incredibly easy to configure and run without manually installing Python modules or a Postgres server.

### 1. Clone the Repository
```bash
git clone https://github.com/ramymegahed/marvel-steel-backend.git
cd marvel-steel-backend
```

### 2. Configuration (Environment Variables)
By default, the `docker-compose.yml` file injects the core environment variables required for the Docker network:
- `DATABASE_URL`: `postgresql://admin:secret123@db:5432/marvel_steel`
- `JWT_SECRET`: `change-this-jwt-secret-in-production`

*(For production, you can place a `.env` file at the root or override these in `docker-compose.yml`)*

### 3. Build and Run the Containers
Spin up the PostgreSQL database and the FastAPI web server seamlessly in detached mode:
```bash
docker-compose up --build -d
```
*Note: A local volume mount is configured, meaning any local code changes to `app/` will trigger a live reload of the server.*

### 4. Run Database Migrations
Once the containers are running, generate the database tables inside your PostgreSQL container by running:
```bash
docker-compose exec web alembic upgrade head
```

---

## 📚 API Documentation

FastAPI automatically generates interactive API documentation. Once your Docker containers are running, you can access your API docs directly in your browser:

- **Swagger UI (Interactive):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc (Alternative):** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🗄️ Database Schema Overview

The backend relies on several core relational models:

- **Admin Base:** Stores `email`, bcrypt `hashed_password`, and `role` (`super_admin` or `staff`).
- **Category:** Groups products. Tracks `name` and `is_active` status.
- **Product:** The core furniture item. Links to a Category. Includes `description`, `materials`.
- **ProductImage:** Multiple image URLs linked to a specific Product. Specifies if an image `is_main`.
- **ProductSize:** Variations of a product. Tracks `size label`, `additional_price`, and `stock_quantity`.
- **Order & OrderItem:** Customer orders. `OrderItem` captures the explicit `price_at_purchase` so past order receipts remain historically accurate even if product prices change later.
- **SiteSettings & Review:** General data for contact info arrays and customer feedback.

from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import SessionLocal, engine
from app.models.admin import Admin
from app.core.security import get_password_hash
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings

# Admin Routers
from app.routers.admin import auth as admin_auth
from app.routers.admin import admins as admin_users
from app.routers.admin import categories as admin_categories
from app.routers.admin import products as admin_products
from app.routers.admin import product_images as admin_images
from app.routers.admin import product_sizes as admin_sizes
from app.routers.admin import orders as admin_orders
from app.routers.admin import dashboard as admin_dashboard
from app.routers.admin import settings as admin_settings
from app.routers.admin import reviews as admin_reviews
from app.routers.admin import analytics as admin_analytics

# Public Routers
from app.routers.public import categories as public_categories
from app.routers.public import products as public_products
from app.routers.public import orders as public_orders
from app.routers.public import reviews as public_reviews
from app.routers.public import cart as public_cart
from app.routers.public import checkout as public_checkout

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure models are created in DB if not already
    Admin.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if any admin exists
        if db.query(Admin).count() == 0:
            print("No admins found in database. Creating default Super Admin...")
            default_email = "admin@marvelsteel.com"
            default_password = "Admin123456"
            hashed_password = get_password_hash(default_password)
            new_admin = Admin(
                email=default_email,
                hashed_password=hashed_password,
                role="super_admin"
            )
            db.add(new_admin)
            db.commit()
            print(f"Successfully created default Super Admin: {default_email}")
    except Exception as e:
        print(f"Failed to create default Super Admin on startup: {e}")
        db.rollback()
    finally:
        db.close()
    
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Marvel Steel MVP",
    version="1.0.0",
    lifespan=lifespan
)

# Set all CORS enabled origins
origins = [
    "http://localhost:5173",
    "https://marvel-steel-eight.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- Admin API Router Setup ---
app.include_router(admin_auth.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin_auth"])
app.include_router(admin_users.router, prefix=f"{settings.API_V1_STR}/admins", tags=["admin_users"])
app.include_router(admin_categories.router, prefix=f"{settings.API_V1_STR}/admin/categories", tags=["admin_categories"])
app.include_router(admin_products.router, prefix=f"{settings.API_V1_STR}/admin/products", tags=["admin_products"])
app.include_router(admin_images.router, prefix=f"{settings.API_V1_STR}/admin/products", tags=["admin_product_images"])
app.include_router(admin_sizes.router, prefix=f"{settings.API_V1_STR}/admin/products", tags=["admin_product_sizes"])
app.include_router(admin_orders.router, prefix=f"{settings.API_V1_STR}/admin/orders", tags=["admin_orders"])
app.include_router(admin_dashboard.router, prefix=f"{settings.API_V1_STR}/admin/dashboard", tags=["admin_dashboard"])
app.include_router(admin_settings.router, prefix=f"{settings.API_V1_STR}/admin/settings", tags=["admin_settings"])
app.include_router(admin_reviews.router, prefix=f"{settings.API_V1_STR}/admin/reviews", tags=["admin_reviews"])
app.include_router(admin_analytics.router, prefix=f"{settings.API_V1_STR}/admin/analytics", tags=["admin_analytics"])

# --- Public API Router Setup ---
app.include_router(public_categories.router, prefix="/categories", tags=["public_categories"])
app.include_router(public_products.router, prefix="/products", tags=["public_products"])
app.include_router(public_orders.router, prefix="/orders", tags=["public_orders"])
app.include_router(public_reviews.router, prefix="/reviews", tags=["public_reviews"])
app.include_router(public_cart.router, prefix=f"{settings.API_V1_STR}/cart", tags=["public_cart"])
app.include_router(public_checkout.router, prefix=f"{settings.API_V1_STR}/checkout", tags=["public_checkout"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Marvel Steel API"}

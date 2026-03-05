from fastapi import FastAPI
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

# Public Routers
from app.routers.public import categories as public_categories
from app.routers.public import products as public_products
from app.routers.public import orders as public_orders
from app.routers.public import reviews as public_reviews

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Marvel Steel MVP",
    version="1.0.0"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain e.g., ["http://localhost:3000"]
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

# --- Public API Router Setup ---
app.include_router(public_categories.router, prefix="/categories", tags=["public_categories"])
app.include_router(public_products.router, prefix="/products", tags=["public_products"])
app.include_router(public_orders.router, prefix="/orders", tags=["public_orders"])
app.include_router(public_reviews.router, prefix="/reviews", tags=["public_reviews"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Marvel Steel API"}

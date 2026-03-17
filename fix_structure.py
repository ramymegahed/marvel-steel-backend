import os
import shutil

backend_dir = r"c:\Users\Lenovo\.gemini\antigravity\scratch\marvel_steel\backend"

# Files/dirs that belong in backend/app/
app_dirs = ["core", "models", "routers", "schemas", "services", "utils", "api", "db", "dependencies"]
app_files = ["main.py", "database.py"]

# Files/dirs that belong in backend/alembic/
alembic_dirs = ["versions"]
alembic_files = ["env.py", "script.py.mako", "README"]

# Files/dirs that belong in backend/uploads/
uploads_dirs = ["products", "categories"]

# 1. Create target directories if they don't exist
app_path = os.path.join(backend_dir, "app")
alembic_path = os.path.join(backend_dir, "alembic")
uploads_path = os.path.join(backend_dir, "uploads")

os.makedirs(app_path, exist_ok=True)
os.makedirs(alembic_path, exist_ok=True)
os.makedirs(uploads_path, exist_ok=True)

# 2. Move app files
for item in app_dirs + app_files:
    src = os.path.join(backend_dir, item)
    if os.path.exists(src):
        dst = os.path.join(app_path, item)
        shutil.move(src, dst)

# 3. Move alembic files
for item in alembic_dirs + alembic_files:
    src = os.path.join(backend_dir, item)
    if os.path.exists(src):
        dst = os.path.join(alembic_path, item)
        shutil.move(src, dst)

# 4. Move uploads files
for item in uploads_dirs:
    src = os.path.join(backend_dir, item)
    if os.path.exists(src):
        dst = os.path.join(uploads_path, item)
        shutil.move(src, dst)

print("Restoration complete.")

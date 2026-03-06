import getpass
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models.admin import Admin
from app.core.security import get_password_hash

# Ensure models are created in DB if not already
Admin.metadata.create_all(bind=engine)

def create_super_admin():
    email = input("Enter super admin email: ").strip()
    if not email:
        print("Email cannot be empty.")
        return

    password = getpass.getpass("Enter password: ")
    if not password:
        print("Password cannot be empty.")
        return

    db: Session = SessionLocal()
    try:
        # Check if user exists
        existing_admin = db.query(Admin).filter(Admin.email == email).first()
        if existing_admin:
            print(f"Admin with email {email} already exists.")
            return

        hashed_password = get_password_hash(password)
        new_admin = Admin(
            email=email,
            hashed_password=hashed_password,
            role="super_admin"
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print(f"Successfully created Super Admin: {email}")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("--- Marvel Steel Super Admin Setup ---")
    create_super_admin()

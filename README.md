# Marvel Steel E-Commerce Platform

Marvel Steel is a modern, full-stack E-Commerce platform for browsing and purchasing high-quality furniture, providing a robust administrative panel, category-based shopping, a robust cart framework with Telegram notifications for new orders, and image uploads.

## Tech Stack
* **Backend Framework:** FastAPI (Python 3.11)
* **Data Validation:** Pydantic V2
* **ORM & Database:** SQLAlchemy 2.0 / PostgreSQL
* **Migrations:** Alembic
* **Containerization:** Docker & Docker Compose
* **Frontend:** React (Deployed on Vercel)

## Architecture Overview
The backend is a purely stateless, RESTful API deployed via Docker containers (typically on Render or AWS ECS). It leverages an external PostgreSQL database for persistent structured data. 

**Image Upload Strategy:**
Category and Product images uploaded via the Admin Portal are stored physically in `app/uploads/`. In cloud contexts like Render with ephemeral filesystems, a **Persistent Disk Mount** must be attached to the `/app/uploads` path to ensure images survive redeploys.

**Telegram Notifications:**
Order placement is completely asynchronous. An HTTP POST request is dispatched inside a FastAPI `BackgroundTasks` queue to alert store managers via Telegram about the latest sales—ensuring a zero-latency checkout experience for the customer.

## Local Setup Guide

Follow these steps to spin up the backend API locally.

### 1. Requirements
Ensure you have Python 3.11+ and PostgreSQL locally installed, or use Docker Desktop.

### 2. Virtual Environment Configuration
```bash
# Clone the repository
git clone git@github.com:your-org/marvel-steel-backend.git
cd marvel_steel

# Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 3. Dependencies
Install all required libraries, including `fastapi`, `sqlalchemy`, and `httpx`.
```bash
pip install -r requirements.txt
```

### 4. Database Setup & Migrations
Create your local PostgreSQL database (e.g., `marvel_steel`). Then, point Alembic to it and synchronize the schema:
```bash
# Ensure DATABASE_URL is set as an environment variable (see below)
alembic upgrade head
```

### 5. Running the Application
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The server will boot up. Your API documentation is located at: `http://localhost:8000/docs`.

## Environment Variables

For the application to connect to external services, create a `.env` file in the root directory (or inject these into your cloud provider's dashboard) with the following exact keys:

| Variable Name | Description |
| :--- | :--- |
| `DATABASE_URL` | The PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`) |
| `SECRET_KEY` | Strongly randomized 256-bit string for JWT Token hashing |
| `TELEGRAM_BOT_TOKEN` | The secure Bot Token received from BotFather |
| `TELEGRAM_CHAT_ID` | The numerical Telegram Chat ID to route the alerts |

## Docker Production Build
The API is shipped with a robust `Dockerfile` executing:
```dockerfile
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```
This guarantees the database is always successfully migrated to align with the schema before the Uvicorn web workers can accept public traffic.

## Author & Maintainers
Developed & Maintained by the **Lecture Brain** dev team.

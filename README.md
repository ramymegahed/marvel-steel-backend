# Marvel Steel MVP Backend

Marvel Steel is an e-commerce backend mapping Admin management APIs and Public Customer interfaces using FastAPI, PostgreSQL, and Pydantic.

## Tech Stack
- **FastAPI** (Python 3.11)
- **PostgreSQL** (Relational Database)
- **SQLAlchemy + Alembic** (ORM & Migrations)

## Running with Docker Compose (Recommended)

This project is fully containerized. You can spin up both the PostgreSQL database and the FastAPI web server effortlessly via Docker Compose. 

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

### 1. Build and Run the Containers
Run the following command in the root of the project directory to build the images and start the services in detached mode:
```bash
docker-compose up --build -d
```
*Note: The first build might take a few minutes as it downloads the PostgreSQL and Python images and installs dependencies.*

### 2. Run Database Migrations
Once the containers are successfully running, you must run the Alembic migrations to create the database tables inside the Postgres container:
```bash
docker-compose exec web alembic upgrade head
```

### 3. Access the APIs
The API is now running on your machine securely connected to your localized Postgres container! 
Live reloading is enabled. If you make changes to your codebase locally, the Docker container's Uvicorn server will automatically restart.

- **Swagger UI (Interactive Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Important Notes
- **Persistence:** The Postgres database data is persistently saved in a Docker Volume (`postgres_data`). Stopping or removing the container will not wipe your tables.
- **Environment Variables:** The `docker-compose.yml` automatically seeds the necessary DB credentials and injects `DATABASE_URL` directly to the `web` container.
- **Port Matching:** The application is mapped to port `8000` for the Web service and `5432` for the Postgres service.

## Stopping the Containers
To stop the application, use:
```bash
docker-compose down
```
*(If you want to clear the persisted database volume as well, run `docker-compose down -v`)*.

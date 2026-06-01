# Inventory & Order Management System

A cloud-deployed full-stack inventory management system built with FastAPI, React, PostgreSQL, and Docker.

## Live Demo

- Frontend: https://inventory-order-management-system-eight.vercel.app/
- API Docs: https://inventory-backend-vfpg.onrender.com/docs
- GitHub Repository: https://github.com/Aditya-govil007/inventory-order-management-system

## Features
- **Dashboard**: High-level metrics and low-stock alerts.
- **Product Management**: Track SKUs, pricing, and stock quantities.
- **Customer Management**: Maintain customer records.
- **Order Management**: Advanced multi-product order creation with strict stock validation and automatic inventory deduction.

## Business Rules

- SKU values must be unique.
- Customer email addresses must be unique.
- Product stock cannot be negative.
- Orders automatically deduct inventory.
- Order creation is transactional and rolls back on failure.
- Low-stock alerts are generated automatically.

## Architecture & Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic, PostgreSQL.
- **Frontend**: Node 22, React 19, Vite, TailwindCSS 3.4.
- **Infrastructure**: Docker, Docker Compose, Nginx.

## System Architecture

```text
React (Vercel)
       │
       ▼
FastAPI (Render)
       │
       ▼
PostgreSQL (Render)
```

## Local Development Setup

### Using Docker Compose (Recommended)
The easiest way to run the entire stack locally is via Docker:
```bash
docker-compose up -d --build
```
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000`
- API Documentation (Swagger): `http://localhost:8000/docs`

### Manual Setup
If you don't have Docker, you can run the services manually:

**Backend Setup:**
1. Navigate to `backend/`.
2. Copy `.env.example` to `.env` and configure your local `DATABASE_URL`.
3. Run `pip install -r requirements.txt`.
4. Run `uvicorn app.main:app --reload`.

**Frontend Setup:**
1. Navigate to `frontend/`.
2. Copy `.env.example` to `.env.local` and set `VITE_API_URL`.
3. Run `npm install`.
4. Run `npm run dev`.

## Production Deployment (Render & Vercel)

The application is specifically optimized for modern cloud deployments.

### 1. Backend (Render)
Render is an excellent choice for the FastAPI backend and PostgreSQL database.
1. Create a new **PostgreSQL Database** on Render. Copy the Internal or External Database URL.
2. Create a new **Web Service** linked to your repository.
3. Set the Root Directory to `backend`.
4. Choose **Docker** as the runtime environment.
5. Add the following Environment Variables:
   - `DATABASE_URL`: Your Render Postgres URL (ensure it uses `postgresql+psycopg2://`).
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://my-app.vercel.app`).
   - `LOW_STOCK_THRESHOLD`: `10`

### 2. Frontend (Vercel)
Vercel provides seamless deployment for Vite/React frontends.
1. Import your repository into Vercel.
2. Set the Framework Preset to **Vite**.
3. Set the Root Directory to `frontend`.
4. Add the Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://my-backend.onrender.com`).
5. Deploy.
*(Note: A `vercel.json` file is already included in the `frontend` directory to automatically handle Single Page Application routing so direct links don't return 404s).*

## API Documentation Summary

The backend automatically generates interactive OpenAPI documentation. Once running, visit `/docs`.

**Key Endpoints:**
- `GET /dashboard/`: Returns aggregate statistics and an array of low-stock products.
- `GET, POST, PUT, DELETE /products/`: Standard CRUD. Validates price > 0, stock >= 0. SKU must be unique.
- `GET, POST, DELETE /customers/`: Standard CRUD. Email must be valid and unique.
- `POST /orders/`: Transactional endpoint. Expects `customer_id` and an array of `items` (`product_id`, `quantity`). Automatically verifies stock, computes total price, deducts inventory, and links relationships. Rolls back entirely if any validation fails.


## Challenges & Learnings

During deployment, I encountered CORS issues between the Vercel frontend and Render backend. This was resolved by configuring FastAPI's CORSMiddleware and environment-based origin management.

Key concepts learned:

- REST API design
- Database relationships and foreign keys
- Transaction management with PostgreSQL
- Docker containerization
- Cloud deployment with Render and Vercel
- CORS and cross-origin communication
- API documentation with Swagger/OpenAPI

## Known Limitations

- Authentication and authorization are not implemented.
- Pagination metadata is not currently available.
- Soft deletes are not implemented.
- Dashboard analytics are based on current data only.





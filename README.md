# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL 15 |
| Frontend | React 18 + React Router |
| Container | Docker + Docker Compose |

## Features

- **Products** — CRUD with unique SKU enforcement, stock tracking
- **Customers** — CRUD with unique email validation
- **Orders** — Create orders with automatic stock reduction; insufficient-stock validation prevents over-selling
- **Dashboard** — Live stats (revenue, low stock alerts, pending orders)
- **API Docs** — Auto-generated Swagger UI at `/docs`

## Business Rules

1. Product SKUs must be unique across the system.
2. Customer emails must be unique.
3. Orders cannot be placed when product stock is insufficient.
4. When an order is created, stock is automatically reduced for each item.
5. When an order is deleted, stock is automatically restored.

## Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run with Docker Compose

```bash
# Clone the repository
git clone <your-repo-url>
cd inventory-system

# Copy and configure env
cp .env.example .env
# Edit .env and set a secure POSTGRES_PASSWORD

# Start all services
docker-compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs:    http://localhost:8000/docs
```

### Run Backend Locally (dev)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # set DATABASE_URL to your local Postgres

uvicorn app.main:app --reload --port 8000
```

### Run Frontend Locally (dev)

```bash
cd frontend
npm install
cp .env.example .env  # set REACT_APP_API_URL=http://localhost:8000/api

npm start
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List all products |
| POST | `/api/products/` | Create product |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers/` | List all customers |
| POST | `/api/customers/` | Create customer |
| GET | `/api/customers/{id}` | Get customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List all orders |
| POST | `/api/orders/` | Create order (validates stock) |
| GET | `/api/orders/{id}` | Get order |
| PUT | `/api/orders/{id}` | Update order status |
| DELETE | `/api/orders/{id}` | Delete order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get summary statistics |

## Docker Hub

```bash
# Push backend image
docker build -t yourdockerhubuser/inventory-backend:latest ./backend
docker push yourdockerhubuser/inventory-backend:latest

# Pull & run
docker pull yourdockerhubuser/inventory-backend:latest
```

## Deployment

### Backend (Render / Railway / Fly.io)
- Set `DATABASE_URL` environment variable pointing to your hosted PostgreSQL.
- Deploy the `backend/` directory or use the Docker image.

### Frontend (Vercel / Netlify)
- Set `REACT_APP_API_URL` to your backend's public URL.
- Run `npm run build` and deploy the `build/` folder.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `inventory` | Database name |
| `DATABASE_URL` | *(constructed)* | Full SQLAlchemy connection string |
| `REACT_APP_API_URL` | `http://localhost:8000/api` | Backend API base URL |

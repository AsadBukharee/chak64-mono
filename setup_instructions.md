# My64 Village Connect — Project Setup Instructions

## 📦 Project Overview

This project is a **full-stack web application** using:

* **Backend:** Django + Django REST Framework (DRF)
* **Frontend:** React (imported from base44.app)
* **Database:** PostgreSQL
* **Async Tasks:** Celery (memory in dev, Redis in prod)
* **Cache (prod):** Redis
* **Deployment:** Docker + Docker Compose + NGINX

---

## 🗂️ Project Structure

```
my-app/
├── backend/        # Django (DRF)
│   ├── manage.py
│   ├── config/
│   ├── auth/
│   └── posts/
├── frontend/       # React (Vite / Next)
│   ├── package.json
│   └── src/
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env
```

---

## ⚙️ Backend Setup (Django + DRF)

### 1. Navigate to backend

```
cd backend
```

### 2. Create virtual environment (optional)

```
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 3. Install dependencies

```
pip install -r requirements.txt
```

### 4. Configure environment variables (`.env`)

```
DEBUG=True
SECRET_KEY=your_secret

DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

ENV=dev
```

---

## ⚡ Celery Setup (IMPORTANT)

### 🧪 Development (Windows-friendly, no Redis)

```
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache+memory://"
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
```

✔ No Redis required
✔ No worker needed
✔ Tasks run synchronously

---

### 🚀 Production (Docker + Redis)

```
CELERY_BROKER_URL = "redis://redis:6379/0"
CELERY_RESULT_BACKEND = "redis://redis:6379/0"
```

Run workers:

```
celery -A config worker -l info
celery -A config beat -l info
```

---

### 🔁 Environment-based config

```
import os

if os.getenv("ENV") == "prod":
    CELERY_BROKER_URL = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND = "redis://redis:6379/0"
else:
    CELERY_BROKER_URL = "memory://"
    CELERY_RESULT_BACKEND = "cache+memory://"
    CELERY_TASK_ALWAYS_EAGER = True
```

---

### ⚠️ Best Practice

Always call tasks like:

```
my_task.delay(data)
```

---

## ▶️ Run Backend

### Migrate DB

```
python manage.py migrate
```

### Start server

```
python manage.py runserver
```

Backend:

```
http://localhost:8000
```

---

## 🎨 Frontend Setup (React)

### 1. Navigate

```
cd frontend
```

### 2. Install

```
npm install
```

### 3. Run

```
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

## 🔗 API Integration

Use relative paths:

```js
const API_BASE = "/api";
```

Example:

```js
fetch("/api/posts/")
```

---

## 🐳 Docker Setup

### Start all services

```
docker-compose up --build
```

### Services:

* Django backend
* React frontend (built)
* PostgreSQL
* Redis (prod)
* Celery worker + beat
* NGINX

---

## 🌐 NGINX Routing

```
/        → React frontend
/api/    → Django backend
```

---

## 🧠 Development Workflow

### Local Dev

* Run Django + React separately
* Celery runs synchronously (no worker)

### Production

* Full Docker stack
* Redis + Celery workers
* NGINX reverse proxy
* No CORS issues

---

## ⚠️ Important Notes

### 1. CORS (dev only)

```
pip install django-cors-headers
```

---

### 2. Static Files

```
python manage.py collectstatic
```

---

### 3. Database

* Use PostgreSQL (Docker)
* Avoid SQLite in production

---

### 4. Celery Limitations in Dev

❌ No async execution
❌ No queue testing
❌ No retry behavior

✔ Only logic testing

---

## 🚀 Deployment (Coolify / Server)

1. Push repo
2. Connect to Coolify
3. Use `docker-compose.yml`
4. Set `ENV=prod`
5. Deploy

---

## 📌 Future Improvements

* JWT Authentication
* Notifications (Celery-based)
* Media uploads (S3)
* WebSockets (live feed)

---

## 👨‍💻 Notes

* Frontend imported from base44.app
* Backend is modular (`auth`, `posts`)
* Keep business logic in controllers
* Celery used for background jobs (prod-ready)

---

## ✅ Done

You now have a setup that supports:

* Simple Windows development (no Redis needed)
* Production-ready async architecture
* Docker + Coolify deployment

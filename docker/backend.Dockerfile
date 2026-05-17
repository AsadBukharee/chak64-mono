FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Create media directory
RUN mkdir -p /app/media/uploads

# Collect static files
RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

# Run migrations on startup, then start gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120"]

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev wget libssl-dev libffi-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create media directory
RUN mkdir -p /app/media/uploads

# Collect static files
RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

# Default command (will be overridden by docker-compose)
CMD ["sh", "-c", "python manage.py migrate --noinput && uvicorn backend.asgi:application --host 0.0.0.0:8000 --workers 4"]

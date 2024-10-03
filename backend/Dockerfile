# Base image olarak Python'ı kullanıyoruz
FROM python:3.9-slim

# Uygulama dizinine gidin
WORKDIR /app

# Sistem bağımlılıklarını yükleyin
RUN apt-get update && apt-get install -y \
    postgresql-client

# Gereksinim dosyalarını kopyalayın ve kurun
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt


# Uygulama dosyalarını kopyalayın
COPY backend /app

RUN mkdir -p /app/backups


# Uygulamayı çalıştırın
ENTRYPOINT ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${API_PORT}"]

# Base image olarak python:3.9-slim kullan
FROM python:3.9-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Sistem paketlerini yükle
RUN apt-get update && apt-get install -y sqlite3

# Gereksinim dosyasını kopyala
COPY backend/requirements.txt .

# Gereksinimleri yükle
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını ve scriptleri kopyala
COPY backend /app

# Yedekleme dizinini oluştur
RUN mkdir -p /app/backups

# Veritabanı ve tablo oluşturma işlemi için CMD veya ENTRYPOINT kullan
# Uygulama başlatma komutunu revize edelim

# Entry-point betiği ile tablo oluşturma ve uygulamayı başlatma
ENTRYPOINT ["sh", "-c", "python /app/create_db.py && python /app/backup_db.py & uvicorn api.main:app --host 0.0.0.0 --port ${API_PORT}"]

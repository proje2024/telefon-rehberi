FROM python:3.9-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Sistem paketlerini yükle
RUN apt-get update && apt-get install -y sqlite3

# Gereksinim dosyasını kopyala
COPY backend/requirements.txt .

# Gereksinimleri yükle
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Veritabanı dosyasını oluşturmak için bir Python betiği ekleyin
COPY backend/api/db/create_db.py /create_db.py

# Veritabanı ve tablo oluşturma işlemini yapın
RUN python /create_db.py

# Yedekleme dizinini oluştur
RUN mkdir -p /app/backups

# Yedekleme scriptini kopyala
COPY backend/api/db/backup_db.py /app/backup_db.py

# Uygulama dosyalarını kopyala
COPY backend /app
# Ortam değişkenini kullanarak yedekleme betiğini ve uygulamayı başlat
CMD ["sh", "-c", "python /app/backup_db.py & uvicorn api.main:apöp --host 0.0.0.0 --port ${API_PORT}"]
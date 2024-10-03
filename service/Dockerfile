# Python uygulamanızın Dockerfile'ı
FROM python:3.9-slim

# Çalışma dizinini oluştur
WORKDIR /app

# Gerekli dosyaları kopyala
COPY service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY service/ /app/

ENV PYTHONUNBUFFERED=1

CMD ["python", "-u", "app.py"]
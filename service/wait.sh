#!/bin/bash

# .env dosyasını yükleyin
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Backend servisi için SQLite veritabanı dosyasının yolu
DB_FILE="${DATABASE_PATH}"

# SQLite veritabanı dosyasının oluşturulmasını bekleyin
while [ ! -f "$DB_FILE" ]; do  # DATABASE_PATH'ı doğru kullanmalısınız
  echo "Waiting for SQLite database to be created..."
  sleep 3
done

echo "SQLite database is ready - executing command"
exec "$@"

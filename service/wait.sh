#!/bin/bash

# .env dosyasını yükleyin
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Backend servisi için SQLite veritabanı dosyasının yolu
DB_FILE="${DATABASE_PATH}"

# SQLite veritabanı dosyasının oluşturulmasını bekleyin
while [ ! -f "$DATABASE_PATH" ]; do
  echo "Waiting for SQLite database to be created..."
  sleep 3
done

echo "SQLite database is ready - executing command"
exec "$@"

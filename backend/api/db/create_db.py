import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Get database connection details from environment variables
DB_USER = os.getenv('POSTGRES_USER')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DB_NAME = os.getenv('POSTGRES_DB')
DB_HOST = os.getenv('POSTGRES_SERVICE_NAME', 'postgres-service')  # Assuming local if not set
DB_PORT = os.getenv('DB_PORT', '5433')  # Use the port defined in your .env

# Construct the database URL for PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"

def create_tables():

    # Veritabanı bağlantısını oluşturun
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Roller tablosu oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT
        )
    ''')
    cursor.execute('''
        INSERT INTO Roles (name, description) VALUES
        ('admin', 'Admin has the capability to do everything'),
        ('users', 'Default users can view directory')
        ON CONFLICT (name) DO NOTHING;
    ''')

    # Abonelik türleri tablosu oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptionTypes (
            id SERIAL PRIMARY KEY,
            subscription_types VARCHAR(255)
        )
    ''')
       
    # Kullanıcılar tablosu oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            surname VARCHAR(255) NOT NULL,
            phone_number VARCHAR(50),
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            role INTEGER DEFAULT 2,
            FOREIGN KEY (role) REFERENCES Roles(id)
        )
    ''')

    # Dizin tablosu oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS directory (
            id SERIAL PRIMARY KEY,
            hiyerId TEXT,
            ataId INTEGER,
            adi TEXT,
            hiyerAd TEXT,
            internal_number_area_code VARCHAR(50),
            internal_number VARCHAR(50),
            internal_number_subscription_id INTEGER DEFAULT 1,
            ip_number_area_code VARCHAR(50),
            ip_number VARCHAR(50),
            ip_number_subscription_id INTEGER DEFAULT 1,
            mailbox TEXT,
            visibility INTEGER DEFAULT 1,
            visibilityForSubDirectory INTEGER DEFAULT 1,
            FOREIGN KEY (internal_number_subscription_id) REFERENCES subscriptionTypes(id),
            FOREIGN KEY (ip_number_subscription_id) REFERENCES subscriptionTypes(id),
            FOREIGN KEY (ataId) REFERENCES directory(id)
        )
    ''')

    # Alt Dizin tablosu oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sub_directory (
            id SERIAL PRIMARY KEY,
            directoryid INTEGER,
            adi TEXT,
            internal_number_area_code VARCHAR(50),
            internal_number VARCHAR(50),
            internal_number_subscription_id INTEGER DEFAULT 1,
            ip_number_area_code VARCHAR(50),
            ip_number VARCHAR(50),
            ip_number_subscription_id INTEGER DEFAULT 1,
            mailbox TEXT,
            FOREIGN KEY (directoryid) REFERENCES directory(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dynamic_attributes (
            id SERIAL PRIMARY KEY,  
            attribute_name TEXT             
        )
    ''')

    # tableid (1 = directory, 2 = sub_directory)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dynamic_data (
            id SERIAL PRIMARY KEY,  
            attributeid INTEGER,
            tableid INTEGER,                  
            recordid TEXT,   
            value TEXT,                      
            
            CHECK (tableid IN (1, 2)),
            FOREIGN KEY (attributeid) REFERENCES dynamic_attributes(id)
        )
    ''')

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    create_tables()
    print("Database and tables created successfully.")

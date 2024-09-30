import os
import time
import requests
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Servis URL'si
SERVICE_URL = os.getenv("SERVICE_URL")

# Veritabanı URL'si
DATABASE_PATH = os.getenv('DATABASE_PATH')  # Backend ile aynı yol
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL)

SLEEP_INTERVAL = int(os.getenv("SLEEP_INTERVAL"))

def insert_data_into_db(engine, data):
    with engine.connect() as connection:
        with connection.begin():
            try:
                for item in data:
                    check_exists = text("""
                    SELECT COUNT(*) FROM directory WHERE id = :id
                    """)
                    result = connection.execute(check_exists, {'id': item['id']}).scalar()

                    if result == 0:
                        insert_directory = text("""
                        INSERT OR IGNORE INTO directory (id, hiyerId, ataId, adi, hiyerAd, internal_number, ip_number, mailbox, 
                                                visibility,visibilityForSubDirectory, ip_number_subscription_id, internal_number_subscription_id)
                        VALUES (:id, :hiyerId, :ataId,:adi,:hiyerAd,  '', '', '', 1, 1, 1, 1)
                        """)

                        values_directory = {'id': item['id'], 'hiyerId': item['hiyerId'], 'ataId': item['ataId'], 'adi': item['ad'], 'hiyerAd': item['hiyerAd']}
                
                        connection.execute(insert_directory, values_directory)
                        print(f"Bu kayıt zaten var: {item['id'], item['ad']}")
                    else:
                        print(f"Bu kayıt zaten var: {item['id'], item['ad']}")

            except Exception as e:
                print(f"Bir hata oluştu: {e}")
                connection.rollback()

def fetch_data():
    try:
        response = requests.get(SERVICE_URL)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch data: {response.status_code}")
            return None
    except Exception as e:
        print(f"Servise ulaşırken hata oluştu: {e}")
        return None

if __name__ == "__main__":
    while True:
        print("Servisten veri alınıyor...")
        data = fetch_data()    
        
        if data:
            insert_data_into_db(engine, data)

        print(f"{SLEEP_INTERVAL} saniye bekleniyor...")
        time.sleep(SLEEP_INTERVAL)

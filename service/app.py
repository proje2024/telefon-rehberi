import os
import time
import requests
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Servis URL'si
SERVICE_URL = os.getenv("SERVICE_URL")

# Veritabanı bağlantı detayları
DB_USER = os.getenv('POSTGRES_USER')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DB_NAME = os.getenv('POSTGRES_DB')
DB_HOST = os.getenv('POSTGRES_SERVICE_NAME')  # Servis adı
DB_PORT = os.getenv('DB_PORT', '5432')  # 5432 varsayılan port

# PostgreSQL bağlantı URL'si
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Bağlantı kontrolü için bir fonksiyon
def create_db_engine():
    try:
        print(DATABASE_URL)
        engine = create_engine(DATABASE_URL)
        # Bağlantıyı test et
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))  # Basit bir sorgu
            for row in result:
                print(row)  # Sonucu yazdır
        print("Veritabanı bağlantısı başarılı!")
        return engine
    except Exception as e:
        print(f"Veritabanı bağlantısı başarısız: {e}")
        return None

SLEEP_INTERVAL = int(os.getenv("SLEEP_INTERVAL"))

def insert_data_into_db(engine, data):
    def is_ataid_in_db(connection, ataid):
        if ataid is None:
            return True
        check_query = text("SELECT COUNT(*) FROM directory WHERE id = :ataid")
        result = connection.execute(check_query, {"ataid": ataid})
        return result.scalar() > 0

    pending_records = [] 

    with engine.connect() as connection:
        with connection.begin():
            try:
                for item in data:
                    if (item['id'] == 1) or (item['ataId'] is None):
                        insert_root = text("""
                            INSERT INTO directory ("id", "hiyerId", "ataId", "adi", "hiyerAd", "internal_number", "ip_number", "mailbox", 
                                                    "visibility", "visibilityForSubDirectory", "ip_number_subscription_id", "internal_number_subscription_id")
                            VALUES (:id, :hiyerId, :ataId, :adi, :hiyerAd, '', '', '', 1, 1, 1, 1)
                            ON CONFLICT (id) 
                            DO UPDATE SET
                                "hiyerId" = EXCLUDED."hiyerId",
                                "ataId" = EXCLUDED."ataId",
                                "adi" = EXCLUDED."adi",
                                "hiyerAd" = EXCLUDED."hiyerAd"
                        """)

                        values_root = {
                            'id': item['id'],
                            'hiyerId': item['hiyerId'],
                            'ataId': item['ataId'],
                            'adi': item['ad'],
                            'hiyerAd': item['hiyerAd']
                        }

                        connection.execute(insert_root, values_root)
                        print(f"Inserted root item with id {item['id']}: {item['ad']}")

                for item in data:
                    if (item['id'] == 1 and item['ataId'] is None) or (item['id'] == 100 and item['ataId'] is None):
                        continue

                    if not is_ataid_in_db(connection, item['ataId']):
                        print(f"Pending Item: {item['id'], item['ad'], item['ataId']}")
                        pending_records.append(item)
                        continue

                    insert_directory = text("""
                        INSERT INTO directory ("id", "hiyerId", "ataId", "adi", "hiyerAd", "internal_number", "ip_number", "mailbox", 
                                                "visibility", "visibilityForSubDirectory", "ip_number_subscription_id", "internal_number_subscription_id")
                        VALUES (:id, :hiyerId, :ataId, :adi, :hiyerAd, '', '', '', 1, 1, 1, 1)
                        ON CONFLICT (id) 
                        DO UPDATE SET
                            "hiyerId" = EXCLUDED."hiyerId",
                            "ataId" = EXCLUDED."ataId",
                            "adi" = EXCLUDED."adi",
                            "hiyerAd" = EXCLUDED."hiyerAd"
                    """)

                    values_directory = {
                            'id': item['id'],
                            'hiyerId': item['hiyerId'],
                            'ataId': item['ataId'],
                            'adi': item['ad'],
                            'hiyerAd': item['hiyerAd']
                        }

                    connection.execute(insert_directory, values_directory)
                    print(f"Inserted nodes {item['id']}: {item['ad']}")

                retry = True
                while retry and pending_records:
                    retry = False
                    for item in pending_records[:]:
                        if is_ataid_in_db(connection, item['ataId']):
                            insert_directory = text("""
                            INSERT INTO directory ("id", "hiyerId", "ataId", "adi", "hiyerAd", "internal_number", "ip_number", "mailbox", 
                                                    "visibility", "visibilityForSubDirectory", "ip_number_subscription_id", "internal_number_subscription_id")
                            VALUES (:id, :hiyerId, :ataId, :adi, :hiyerAd, '', '', '', 1, 1, 1, 1)
                            ON CONFLICT (id) 
                            DO UPDATE SET
                                "hiyerId" = EXCLUDED."hiyerId",
                                "ataId" = EXCLUDED."ataId",
                                "adi" = EXCLUDED."adi",
                                "hiyerAd" = EXCLUDED."hiyerAd"
                            """)

                            values_directory = {
                                'id': item['id'],
                                'hiyerId': item['hiyerId'],
                                'ataId': item['ataId'],
                                'adi': item['ad'],
                                'hiyerAd': item['hiyerAd']
                            }

                            connection.execute(insert_directory, values_directory)
                            print(f"Inserted pending nodes {item['id']}: {item['ad']}")

                            pending_records.remove(item)
                            retry = True  

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
            print("Servisten veri alındı...")
            
            # Bağlantıyı oluştur
            engine = create_db_engine()
            if engine is None:
                print("Veritabanı bağlantısı yok. Tekrar veri bağlantısı kurulmaya çalışılıyor...")
                engine = create_db_engine()
                
            insert_data_into_db(engine, data)

        print(f"{SLEEP_INTERVAL} saniye bekleniyor...")
        time.sleep(SLEEP_INTERVAL)

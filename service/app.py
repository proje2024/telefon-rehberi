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
    print("Veriler işleniyor...")
    
    # ataId'si None olan veriyi bul
    null_ataId_items = [item for item in data if item['ataId'] is None]
    first_insert_items = [item for item in data if item['id'] == 1]  # id'si 1 olan item
    other_items = [item for item in data if item['ataId'] is not None and item['id'] != 1]
    
    # Sıralama işlemi: diğerlerini ataId'ye göre sırala
    sorted_other_items = sorted(other_items, key=lambda x: x['ataId'])

    with engine.connect() as connection:
        with connection.begin():
            try:
                # 1. Öncelikle ataId'si None olan veriyi ekle
                for item in null_ataId_items:
                    # Kayıt zaten mevcut mu kontrolü
                    check_exists = text("SELECT COUNT(*) FROM directory WHERE id = :id")
                    result = connection.execute(check_exists, {'id': item['id']}).scalar()

                    if result == 0:
                        insert_directory = text("""
                        INSERT INTO directory ("id", "hiyerId", "ataId", "adi", "hiyerAd", "internal_number", "ip_number", "mailbox", 
                                                "visibility", "visibilityForSubDirectory", "ip_number_subscription_id", "internal_number_subscription_id")
                        VALUES (:id, :hiyerId, :ataId, :adi, :hiyerAd, '', '', '', 1, 1, 1, 1)
                        """)

                        values_directory = {
                            'id': item['id'],
                            'hiyerId': item['hiyerId'],
                            'ataId': item['ataId'],
                            'adi': item['ad'],
                            'hiyerAd': item['hiyerAd']
                        }

                        connection.execute(insert_directory, values_directory)
                        print(f"Yeni Kayıt Eklendi: {item['id'], item['ad'], item['ataId']}")
                    else:
                        print(f"Bu kayıt zaten var: {item['id'], item['ad'], item['ataId']}")

                # 2. Daha sonra id=1, ataId=1, hiyerId=1 olan veriyi ekle
                for item in first_insert_items:
                    # Kayıt zaten mevcut mu kontrolü
                    check_exists = text("SELECT COUNT(*) FROM directory WHERE id = :id")
                    result = connection.execute(check_exists, {'id': item['id']}).scalar()

                    if result == 0:
                        insert_directory = text("""
                        INSERT INTO directory ("id", "hiyerId", "ataId", "adi", "hiyerAd", "internal_number", "ip_number", "mailbox", 
                                                "visibility", "visibilityForSubDirectory", "ip_number_subscription_id", "internal_number_subscription_id")
                        VALUES (:id, :hiyerId, :ataId, :adi, :hiyerAd, '', '', '', 1, 1, 1, 1)
                        """)

                        values_directory = {
                            'id': item['id'],
                            'hiyerId': item['hiyerId'],
                            'ataId': item['ataId'],
                            'adi': item['ad'],
                            'hiyerAd': item['hiyerAd']
                        }

                        connection.execute(insert_directory, values_directory)
                        print(f"Yeni Kayıt Eklendi: {item['id'], item['ad'], item['ataId']}")
                    else:
                        print(f"Bu kayıt zaten var: {item['id'], item['ad'], item['ataId']}")

                # 3. Son olarak ataId'ye göre sıralanmış verileri ekle
                for item in sorted_other_items:
                    # Kayıt zaten mevcut mu kontrolü
                    check_exists = text("SELECT COUNT(*) FROM directory WHERE id = :id")
                    result = connection.execute(check_exists, {'id': item['id']}).scalar()

                    if result == 0:
                        insert_directory = text("""
                        INSERT INTO directory ("id", "hiyerId", "ataId", "adi", "hiyerAd", "internal_number", "ip_number", "mailbox", 
                                                "visibility", "visibilityForSubDirectory", "ip_number_subscription_id", "internal_number_subscription_id")
                        VALUES (:id, :hiyerId, :ataId, :adi, :hiyerAd, '', '', '', 1, 1, 1, 1)
                        """)

                        values_directory = {
                            'id': item['id'],
                            'hiyerId': item['hiyerId'],
                            'ataId': item['ataId'],
                            'adi': item['ad'],
                            'hiyerAd': item['hiyerAd']
                        }

                        connection.execute(insert_directory, values_directory)
                        print(f"Yeni Kayıt Eklendi: {item['id'], item['ad'], item['ataId']}")
                    else:
                        print(f"Bu kayıt zaten var: {item['id'], item['ad'], item['ataId']}")

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

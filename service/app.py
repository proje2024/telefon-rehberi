import requests
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Servis URL'si
SERVICE_URL = os.getenv("SERVICE_URL")

# database url .env
DATABASE_PATH = os.getenv('DATABASE_PATH')
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL)

def insert_data_into_db(engine, data):
    with engine.connect() as connection:
        # Start a transaction
        with connection.begin():
            try:
                for item in data:
                    insert_hiyerarcy = text("""
                    INSERT OR IGNORE INTO hiyerarcy (id, adi, hiyerAd, internal_number, ip_number, mailbox, visibility,visibilityForSubDirectory, ip_number_subscription_id, internal_number_subscription_id) 
                    VALUES (:id, :adi, :hiyerAd, '', '', '', 1, 1, 1, 1)
                    """)
                    values_hiyerarcy = {'id': item['hiyerId'], 'adi': item['ad'], 'hiyerAd': item['hiyerAd']}
                    connection.execute(insert_hiyerarcy, values_hiyerarcy)

                    #Loglama
                    print("Hierarchy bilgisi insert edildi!")
                    print("Sql Insert Query:" + insert_hiyerarcy)
                    print("Hierarcy Values:" + values_hiyerarcy)

                    insert_directory = text("""
                    INSERT OR IGNORE INTO directory (id, hiyerId, ataId)
                    VALUES (:id, :hiyerId, :ataId)
                    """)

                    values_directory = {'id': item['id'], 'hiyerId': item['hiyerId'], 'ataId': item['ataId']}
            
                    check_hierarchy = text("""
                        SELECT COUNT(*)
                        FROM hiyerarcy
                        WHERE id = :id
                    """)

                    result = connection.execute(check_hierarchy, {"id": item['hiyerId']})
                    count = result.scalar()

                    if count > 0:
                        connection.execute(insert_directory, values_directory)
                        #Loglama
                        print("Directory bilgisi insert edildi!")
                        print("Sql Insert Query:" + insert_directory)
                        print("Directory Values:" + values_directory)

            except Exception as e:
                print(f"Bir hata oluştu: {e}")
                connection.rollback()



def fetch_data():
    response = requests.get(SERVICE_URL)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data: {response.status_code}")
        return None

if __name__ == "__main__":
    data = fetch_data()    
    if data:
        insert_data_into_db(engine, data)
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from api.utils import get_password_hash
from .base import Base
from .models import User
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

# Bağlantıyı oluştur
engine = create_db_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    # Create all tables in the database (based on the Base class)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    # Check if admin user exists and create if not
    if not db.query(User).filter(User.username == "admin").first():
        admin_user = User(
            username=os.getenv("DEFAULT_ADMIN"),
            name="",
            surname="",
            phone_number="",
            email="",
            password=get_password_hash(os.getenv("DEFAULT_PASSWORD")),
            role=1,
        )

        db.add(admin_user)
        db.flush()

    db.commit()
    db.close()

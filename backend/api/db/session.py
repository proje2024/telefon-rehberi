from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get database connection details from environment variables
DB_USER = os.getenv('POSTGRES_USER')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DB_NAME = os.getenv('POSTGRES_DB')
DB_HOST = os.getenv('POSTGRES_HOST', 'localhost')  # Default to localhost if not set
DB_PORT = os.getenv('DB_PORT', '5432')  # Default PostgreSQL port

# Construct the PostgreSQL database URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

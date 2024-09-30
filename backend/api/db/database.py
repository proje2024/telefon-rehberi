from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from api.utils import get_password_hash
from .base import Base
from .models import User, SubscriptionTypes
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database connection details from environment variables
DB_USER = os.getenv('POSTGRES_USER')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DB_NAME = os.getenv('POSTGRES_DB')
DB_HOST = os.getenv('HOST', 'localhost')  # Assuming local if not set
DB_PORT = os.getenv('DB_PORT', '5433')  # Use the port defined in your .env

# Construct the database URL for PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)
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

        # Define subscriptions
        subscription1 = SubscriptionTypes(subscription_types="substype1")
        subscription2 = SubscriptionTypes(subscription_types="substype2")
        subscription3 = SubscriptionTypes(subscription_types="substype3")

        # Add subscriptions and admin user to the session
        db.add(subscription1)
        db.add(subscription2)
        db.add(subscription3)
        db.add(admin_user)
        db.flush()

    db.commit()
    db.close()

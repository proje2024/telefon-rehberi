from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from api.utils import get_password_hash
from .base import Base
from .models import User, SubscriptionTypes, Hierarchy, Directory
import os
from dotenv import load_dotenv

load_dotenv()


DATABASE_PATH = os.getenv('DATABASE_PATH')
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
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

        subscription1 = SubscriptionTypes(
            subscription_types="substype1"
        )
        subscription2 = SubscriptionTypes(
            subscription_types="substype2"
        )
        subscription3 = SubscriptionTypes(
            subscription_types="substype3"
        )

        db.add(subscription1)
        db.add(subscription2)
        db.add(subscription3)
        db.add(admin_user)
        db.flush()

    db.commit()
    db.close()


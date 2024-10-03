from sqlalchemy import (Column, Integer, String, Text, ForeignKey, Boolean)
from sqlalchemy.orm import relationship
from sqlalchemy.types import UserDefinedType
from sqlalchemy.ext.hybrid import hybrid_property
from .base import Base
from passlib.context import CryptContext
from sqlalchemy.dialects.postgresql import JSONB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # SQLAlchemy Model


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    description = Column(Text)

    users = relationship("User", back_populates="role_rel")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    surname = Column(String(50), nullable=False)
    phone_number = Column(String(50))
    username = Column(String(255), unique=True)
    password = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(Integer, ForeignKey("roles.id"), default=2)

    role_rel = relationship("Role", back_populates="users")

class SubscriptionTypes(Base):
    __tablename__ = "subscriptiontypes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subscription_types = Column(Text, nullable=False)


class Directory(Base):
    __tablename__ = "directory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hiyerId = Column(Text, nullable=True)
    ataId = Column(Integer, ForeignKey("directory.id"), nullable=True)
    adi = Column(Text, nullable=False)
    hiyerAd = Column(Text, nullable=False)
    internal_number_area_code = Column(Text, nullable=True)
    internal_number = Column(Text, nullable=True)
    internal_number_subscription_id = Column(Integer, ForeignKey("subscriptiontypes.id"), nullable=False, default=1)
    ip_number_area_code = Column(Text, nullable=True)
    ip_number = Column(Text, nullable=True)
    ip_number_subscription_id = Column(Integer, ForeignKey("subscriptiontypes.id"), nullable=False, default=1)
    mailbox = Column(Text, nullable=True)
    visibility = Column(Integer, nullable=True, default=1)
    visibilityForSubDirectory = Column(Integer, nullable=True, default=1)

    # Define explicit relationships
    internal_subscription_type = relationship("SubscriptionTypes", foreign_keys=[internal_number_subscription_id], uselist=False)
    ip_subscription_type = relationship("SubscriptionTypes", foreign_keys=[ip_number_subscription_id], uselist=False)
    parent = relationship("Directory", remote_side=[id], backref='children')

class Sub_Directory(Base):
    __tablename__ = "sub_directory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    directoryid = Column(Integer, ForeignKey("directory.id"), nullable=True)
    adi = Column(Text, nullable=False)
    internal_number_area_code = Column(Text, nullable=True)
    internal_number = Column(Text, nullable=True)
    internal_number_subscription_id = Column(Integer, ForeignKey("subscriptiontypes.id"), nullable=False, default=1)
    ip_number_area_code = Column(Text, nullable=True)
    ip_number = Column(Text, nullable=True)
    ip_number_subscription_id = Column(Integer, ForeignKey("subscriptiontypes.id"), nullable=False, default=1)
    mailbox = Column(Text, nullable=True)

    parent = relationship("Directory", remote_side=[Directory.id])
    internal_subscription_type = relationship("SubscriptionTypes", foreign_keys=[internal_number_subscription_id], uselist=False)
    ip_subscription_type = relationship("SubscriptionTypes", foreign_keys=[ip_number_subscription_id], uselist=False)

class DynamicColumn(Base):
    __tablename__ = "dynamic_attributes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    attribute_name = Column(Text, nullable=True)

class DynamicColumnData(Base):
    __tablename__ = "dynamic_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    attributeid = Column(Integer, ForeignKey('dynamic_attributes.id', ondelete='CASCADE'), nullable=True)
    tableid = Column(Integer, nullable=False)
    recordid = Column(Integer, nullable=False)
    value = Column(Text, nullable=True)

from pydantic import BaseModel, EmailStr
from typing import Optional, List


# # Pydantic Models

class UserCreateV(BaseModel):
    username: Optional[str]
    name: Optional[str]
    surname: Optional[str]
    email: EmailStr
    password: str
    phone_number: Optional[str]

class DynamicColumn(BaseModel):
    id: int
    value: str

class DirectoryEditV(BaseModel):
    id: Optional[str]
    adi: Optional[str]
    internal_number_area_code: Optional[str]
    internal_number: Optional[str]
    internal_number_subscription_id: Optional[int]
    ip_number_area_code: Optional[str]
    ip_number: Optional[str]
    ip_number_subscription_id: Optional[int]
    mailbox: Optional[str]
    visibility: Optional[int]
    visibilityForSubDirectory: Optional[int]
    dynamicColumns: Optional[List[DynamicColumn]] = None


class SubscriptionCreateV(BaseModel):
    subscription_types: Optional[str]

class SubscriptionEditV(BaseModel):
    id: Optional[int]
    subscription_types: Optional[str]

class SubDirectoryCreateV(BaseModel):
    directoryid: Optional[int]
    adi: Optional[str]
    internal_number_area_code: Optional[str]
    internal_number: Optional[str]
    internal_number_subscription_id: Optional[int]
    ip_number_area_code: Optional[str]
    ip_number: Optional[str]
    ip_number_subscription_id: Optional[int]
    mailbox: Optional[str]
    dynamicColumns: Optional[List[DynamicColumn]] = None

class SubDirectoryEditV(BaseModel):
    id: str
    adi: Optional[str] = None
    internal_number_area_code: Optional[str] = None
    internal_number: Optional[str] = None
    ip_number_area_code: Optional[str] = None
    ip_number: Optional[str] = None
    mailbox: Optional[str] = None
    internal_number_subscription_id: Optional[int] = None
    ip_number_subscription_id: Optional[int] = None
    dynamicColumns: Optional[List[DynamicColumn]] = None

class DynamicColumnCreateV(BaseModel):
    attribute_name: Optional[str]

class DynamicColumnEditV(BaseModel):
    id: Optional[int]
    attribute_name: Optional[str]
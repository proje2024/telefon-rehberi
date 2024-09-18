from fastapi import FastAPI, status, HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from api.db.models import User
from api.deps import get_db, oauth2_scheme, get_current_user
from api.schemas import UserCreateV
from api.utils import (
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_password,
)

router = APIRouter()


@router.get("/me", summary="Get details of currently logged in user")
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/login", summary="Create access and refresh tokens for user")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı adı veya şifre!",
        )
    access_token = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)
    return {"access_token": access_token, "refresh_token": refresh_token}


@router.get("/login")
async def login2():
    return {"msg": "Kullanıcı giriş sayfası"}


@router.post("/register")
async def register_user(user_data: UserCreateV, db: Session = Depends(get_db)):
    db_user = (
        db.query(User)
        .filter(
            (User.username == user_data.username)
        )
        .first()
    )
    if db_user:
        raise HTTPException(
            status_code=400, detail="Kullanıcı adı kullanımda!"
        )

    new_user = User(
        username=user_data.username,
        name=user_data.name,
        surname=user_data.surname,
        phone_number=user_data.phone_number,
        email=user_data.email,
        password=get_password_hash(user_data.password),
        role=2,
    )

    db.add(new_user)

    try:
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Kayıt işlemi başrısız {e}.")
    return {
        "id": str(new_user.id),
        "username": new_user.username,
        "phone_number": new_user.phone_number,
        "role": new_user.role,
        "message": "Kullanıcı başarıyla kayıt edildi!",
    }


@router.post("/logout", summary="Logout the user")
async def logout(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    print(f"User {user.username} logged out!")
    return {"message": "Başarı ile çıkış yapıldı"}


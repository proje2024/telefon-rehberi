from fastapi import APIRouter
from api.routers import auth,directory

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(directory.router, prefix="/directory", tags=["directory"])

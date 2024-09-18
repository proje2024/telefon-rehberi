import uvicorn
from fastapi import FastAPI
from .db.database import init_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from api.routers.router import api_router
from dotenv import load_dotenv
import os

# .env dosyasını yükle
load_dotenv()

# PORT değerini .env dosyasından al
port = int(os.getenv("API_PORT"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/home")
def read_root():
    return {"message": "Welcome to the Inventory Management System"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=port)

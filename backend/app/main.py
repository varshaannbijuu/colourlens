from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import colorize, history

app = FastAPI()

# ✅ CORS FIX (ALLOW FRONTEND ON VERCEL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 allow all origins (fixes CORS)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(colorize.router, prefix="/api")
app.include_router(history.router, prefix="/api")

app.mount("/static/uploads", StaticFiles(directory="storage/uploads"), name="uploads")
app.mount("/static/results", StaticFiles(directory="storage/results"), name="results")

@app.get("/")
def root():
    return {"status": "ColorLens backend running"}

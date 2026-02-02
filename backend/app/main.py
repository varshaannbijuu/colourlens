from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import colorize, history

app = FastAPI()

# 🔥 DEV-PROOF CORS CONFIG (NO MORE PORT ISSUES)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
    ],
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

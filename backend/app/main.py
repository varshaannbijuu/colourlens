from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.requests import Request

from app.routes import colorize, history

app = FastAPI()

# 🔥 PERMANENT CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://colourlens-efn1.vercel.app",
    ],
    allow_credentials=False,  # 🔑 MUST be False for browser safety
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 EXPLICIT PREFLIGHT HANDLER (this kills the error permanently)
@app.options("/{path:path}")
async def preflight_handler(request: Request, path: str):
    return JSONResponse(status_code=200)

# Routers
app.include_router(colorize.router, prefix="/api")
app.include_router(history.router, prefix="/api")

# Static files
app.mount("/static/uploads", StaticFiles(directory="storage/uploads"), name="uploads")
app.mount("/static/results", StaticFiles(directory="storage/results"), name="results")

@app.get("/")
def root():
    return {"status": "ColorLens backend running"}

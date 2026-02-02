from fastapi import APIRouter
from app.routes.colorize import HISTORY

router = APIRouter()


@router.get("/history")
def get_history():
    return HISTORY

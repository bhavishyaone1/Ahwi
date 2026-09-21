"""
Ask AETHER Natural Language Query Router
"""
from typing import Any, Dict
from pydantic import BaseModel, Field
from fastapi import APIRouter
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/query", tags=["Ask AETHER"])


class QueryRequest(BaseModel):
    query: str = Field(..., description="Natural language operator query e.g. 'Why is rainfall confidence low in Delhi?'")


@router.post("")
def ask_aether(req: QueryRequest) -> Dict[str, Any]:
    """
    Parses operator question, retrieves real pipeline data, and formats a verified response.
    Never invents or hallucinates weather numbers.
    """
    return aether_service.handle_operator_query(req.query)

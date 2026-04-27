from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.deck_service import generate_deck_file
from services.hybrid_retriever import retrieve
from services.rag_service import build_context
import os

router = APIRouter()

class DeckRequest(BaseModel):
    prompt: str
    org_id: str

@router.post("/generate")
async def generate_deck_endpoint(req: DeckRequest):
    # 1. Retrieve context for the deck
    results = await retrieve(req.prompt, org_id=req.org_id, top_k=10)
    context = build_context(results)
    
    # 2. Generate the deck
    try:
        file_path = await generate_deck_file(req.prompt, context, req.org_id)
        return {"status": "success", "file_path": file_path, "filename": os.path.basename(file_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{org_id}/{filename}")
async def download_deck(org_id: str, filename: str):
    file_path = os.path.join("./storage", org_id, "decks", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)

from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
import os
import aiofiles
import uuid
from typing import Optional
from services.ingestion_service import parse_document
from routers.embed import process_note_embedding
from db.postgres import get_db

router = APIRouter()

STORAGE_DIR = os.getenv("STORAGE_DIR", "./storage")

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    org_id: str = Form(...),
    title: Optional[str] = Form(None)
):
    doc_id = str(uuid.uuid4())
    org_storage = os.path.join(STORAGE_DIR, org_id, doc_id)
    os.makedirs(org_storage, exist_ok=True)
    
    file_path = os.path.join(org_storage, file.filename)
    
    content = await file.read()
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
        
    # Parse text
    try:
        text = parse_document(file.filename, content)
    except Exception as e:
        print(f"Error parsing {file.filename}: {e}")
        text = f"Error parsing document: {str(e)}"

    doc_title = title or file.filename
    
    # Save as "Note" in DB first (so existing embedding logic can find it)
    async with get_db() as conn:
        await conn.execute('''
            INSERT INTO notes (id, "orgId", title, content, tags)
            VALUES ($1, $2::uuid, $3, $4, $5)
        ''', doc_id, org_id, doc_title, text, [file.filename.split(".")[-1].upper()])
        
    # Trigger existing hybrid retrieval embedding and graph extraction pipeline
    background_tasks.add_task(process_note_embedding, doc_id, org_id, doc_title, text)
    
    return {
        "status": "processing", 
        "doc_id": doc_id, 
        "filename": file.filename,
        "org_id": org_id
    }

import json
from typing import List
from models.schemas import ChunkResult, NoteResult
from db.postgres import get_db

async def vector_search(embedding: List[float], org_id: str, top_k: int) -> List[ChunkResult]:
    embed_str = json.dumps(embedding)
    query = """
        SELECT id, "noteId", content, 1 - (embedding <=> $1::vector) as score
        FROM chunks
        WHERE "orgId" = $2::uuid
        ORDER BY embedding <=> $1::vector
        LIMIT $3
    """
    async with get_db() as conn:
        rows = await conn.fetch(query, embed_str, org_id, top_k)
        
    return [ChunkResult(id=str(r['id']), note_id=str(r['noteId']), content=r['content'], score=r['score']) for r in rows]

async def note_search(embedding: List[float], org_id: str, top_k: int) -> List[NoteResult]:
    embed_str = json.dumps(embedding)
    query = """
        SELECT id, title, content, 1 - (embedding <=> $1::vector) as score
        FROM notes
        WHERE "orgId" = $2::uuid
        ORDER BY embedding <=> $1::vector
        LIMIT $3
    """
    async with get_db() as conn:
        rows = await conn.fetch(query, embed_str, org_id, top_k)
        
    return [NoteResult(id=str(r['id']), title=r['title'], content=r['content'], score=r['score']) for r in rows]

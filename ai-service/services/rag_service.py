from typing import AsyncGenerator, List, Dict, Any
from services.graph_service import get_llm

def build_context(results: List[Dict[str, Any]]) -> str:
    context = ""
    for r in results:
        context += f"--- Note (Source: {r['source']}) ---\n{r['content']}\n\n"
    return context

def build_prompt(question: str, context: str, history: List[Dict[str, str]], org_name: str = "the company") -> str:
    history_str = ""
    for msg in history:
        history_str += f"{msg['role']}: {msg['content']}\n"
        
    prompt = f"""
You are the Institutional Knowledge Consultant for {org_name}. 
Your goal is to provide investors and team members with accurate, grounded, and professional insights based on the company's internal data room.

GUIDELINES:
1. **Prioritize Context**: Use the provided context as your primary source of truth.
2. **Citations**: When referencing a specific piece of information, cite the source note title (e.g., [Source: Series A Pitch Deck]).
3. **Professionalism**: Maintain a professional, executive-level tone. Be concise but thorough.
4. **Groundedness**: If the answer is not in the context, state that you don't have that specific information in the data room, but you can provide general industry perspective if relevant.
5. **Multi-source Synthesis**: Combine information from the Vector Search (semantic) and Knowledge Graph (structural) to provide a complete picture.

Context:
{context}

Conversation History:
{history_str}

User Question: {question}
Answer:"""
    return prompt

async def stream_answer(prompt: str) -> AsyncGenerator[str, None]:
    llm = get_llm()
    async for chunk in llm.astream(prompt):
        if chunk.content:
            yield chunk.content

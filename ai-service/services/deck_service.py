import os
import uuid
import subprocess
import tempfile
from services.graph_service import get_llm
from langchain.prompts import PromptTemplate

DECK_GEN_PROMPT = """
You are an expert Pitch Deck Designer and Python Developer.
Your task is to write a single Python script that uses the `python-pptx` library to create a professional investor deck.

OBJECTIVE:
Create a deck based on this request: {user_request}

DATA CONTEXT:
{context}

REQUIREMENTS:
1. Use `from pptx import Presentation`.
2. Use professional layouts (Title, Content with Bullets, etc.).
3. Incorporate the data from the context accurately.
4. The script MUST save the presentation to a file named `output.pptx`.
5. Do not use any external images unless they are placeholder shapes with text.
6. The script should be self-contained and runnable.
7. ONLY output the Python code. No explanations, no markdown blocks.

Python Code:
"""

async def generate_deck_file(user_request: str, context: str, org_id: str) -> str:
    llm = get_llm()
    prompt = DECK_GEN_PROMPT.format(user_request=user_request, context=context)
    
    # Generate the code
    res = await llm.ainvoke(prompt)
    code = res.content.strip()
    
    # Remove markdown code blocks if present
    if code.startswith("```python"):
        code = code[9:]
    if code.endswith("```"):
        code = code[:-3]
    
    # Create a temporary directory to run the code
    with tempfile.TemporaryDirectory() as tmpdir:
        script_path = os.path.join(tmpdir, "gen_deck.py")
        output_pptx = os.path.join(tmpdir, "output.pptx")
        
        with open(script_path, "w") as f:
            f.write(code)
            
        # Execute the script
        try:
            subprocess.run(["python3", script_path], cwd=tmpdir, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            print(f"Error executing generated deck code: {e.stderr.decode()}")
            raise Exception("Failed to generate deck")
            
        # Move the output to permanent storage
        storage_dir = os.path.join("./storage", org_id, "decks")
        os.makedirs(storage_dir, exist_ok=True)
        
        deck_id = str(uuid.uuid4())
        final_path = os.path.join(storage_dir, f"{deck_id}.pptx")
        
        if os.path.exists(output_pptx):
            os.rename(output_pptx, final_path)
            return final_path
        else:
            raise Exception("Deck file was not created by the script")

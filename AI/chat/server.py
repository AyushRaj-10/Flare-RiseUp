import fitz
import os
import requests
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# NEW IMPORTS FOR RAG
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API:
    raise Exception("❌ Add OPENROUTER_API_KEY in .env")

# 📌 GLOBAL VARIABLES
extracted_chunks = []
index = None
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")  # FREE

# ------------------ UTILITY FUNCTIONS ------------------ #

def embed_text(texts):
    """Convert list of text chunks into embeddings"""
    vectors = embedding_model.encode(texts)
    return np.array(vectors).astype("float32")

def create_vector_store(chunks):
    """Create FAISS index from chunks"""
    global index
    vectors = embed_text(chunks)
    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(vectors)

def search_chunks(query, k=3):
    """Search most relevant chunks using FAISS"""
    if index is None:
        return []
    query_vec = embed_text([query])
    distances, positions = index.search(query_vec, k)
    result = [extracted_chunks[i] for i in positions[0]]
    return result

# ------------------ API ENDPOINTS ------------------ #

@app.post("/upload")
async def upload_file(file: UploadFile):
    global extracted_chunks, index

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    # ✅ FIX: Create 'temp' directory if it doesn't exist
    if not os.path.exists("temp"):
        os.makedirs("temp")

    content = await file.read()
    file_path = f"temp/{file.filename}"
    
    # Now this will work because the folder exists
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        doc = fitz.open(file_path)
        full_text = "".join(page.get_text() for page in doc)
        doc.close() # Good practice to close the file
    except Exception as e:
        print(f"PDF Error: {e}") # Print error for debugging
        raise HTTPException(status_code=500, detail="Failed to read PDF")

    # 📌 SPLIT INTO CHUNKS (RAG)
    extracted_chunks = [full_text[i:i+1200] for i in range(0, len(full_text), 1200)]

    # 📌 BUILD VECTOR STORE
    if extracted_chunks:
        create_vector_store(extracted_chunks)
    
    # Cleanup: Delete the temp file to keep folder clean
    if os.path.exists(file_path):
        os.remove(file_path)

    return {"message": "PDF uploaded & indexed successfully!", "chunks": len(extracted_chunks)}

@app.get("/ask")
async def ask(question: str):
    if not extracted_chunks:
        return {"answer": "Upload a document first."}

    # 📌 Get top relevant document parts
    context_chunks = search_chunks(question)
    combined_context = "\n\n".join(context_chunks)

    prompt = f"""
### CONTEXT ###
{combined_context}

### TASK ###
Answer the question based on the above context.

👉 If the question requires FACTS (like names, numbers, dates, address, rent amount), answer EXACTLY from the context.

👉 If the question requires ANALYSIS (like important keywords, summary, main points), analyze the context and generate the result.

🚫 If the required factual info is NOT present, reply EXACTLY: "Not available in document."

### QUESTION ###
{question}
"""

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API}",
            "Content-Type": "application/json"
        },
        json={
            "model": "openai/gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0
        }
    )

    try:
        answer = response.json()["choices"][0]["message"]["content"]
        return {"answer": answer}
    except:
        return {"answer": "API Error: " + response.text}
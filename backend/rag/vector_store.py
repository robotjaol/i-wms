import os
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import UnstructuredFileLoader
from fastapi import UploadFile
import tempfile

CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
EMBEDDINGS = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_chroma():
    """Get a persistent ChromaDB vector store with local embeddings."""
    if not os.path.exists(CHROMA_PATH):
        os.makedirs(CHROMA_PATH, exist_ok=True)
    return Chroma(persist_directory=CHROMA_PATH, embedding_function=EMBEDDINGS)

async def vectorize_file(file: UploadFile, doc_type: str = "auto"):
    """Vectorize a document and store in ChromaDB."""
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        loader = UnstructuredFileLoader(tmp_path)
        docs = loader.load()
        if not docs:
            return {"error": "No text found in document."}
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(docs)
        if not chunks:
            return {"error": "No chunks created from document."}
        db = get_chroma()
        ids = db.add_documents(chunks)
        return {"status": "success", "chunks": len(chunks), "ids": ids}
    except Exception as e:
        return {"error": str(e)}
    finally:
        os.remove(tmp_path)

async def query_rag(query: str, context_id: str = None):
    """Perform RAG: retrieve context and answer with Ollama LLM."""
    try:
        db = get_chroma()
        docs = db.similarity_search(query, k=4)
        context = "\n".join([d.page_content for d in docs if hasattr(d, 'page_content')])
        from .llm_chain import run_llm_chain
        answer = run_llm_chain(query, context)
        return {"answer": answer, "citations": [getattr(d, 'metadata', {}) for d in docs]}
    except Exception as e:
        return {"error": str(e)} 
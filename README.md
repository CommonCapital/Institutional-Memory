# Business AI Data Room 🧠🕸️💼

Built on top of [MemoryOS](https://github.com/CommonCapital/MemoryOS.git)

A B2B SaaS platform that transforms institutional knowledge into a secure, interactive AI consultant. Designed for startups and venture-backed companies to serve their "data room" to investors, enabling cited, grounded answers to any due diligence question.

## 🚀 Key Features

### 1. Multi-Tenant Infrastructure
- **Org-Scoped Data:** Every document, note, and graph node is strictly isolated by organization ID.
- **Better Auth Integration:** Enterprise-grade authentication with built-in organization management and member roles.
- **Local Persistence:** Data is stored in org-scoped folders on the local filesystem, ensuring privacy and control.

### 2. Multi-Format Document Ingestion
- **Native Support:** Upload and parse `PDF`, `PPTX`, `XLSX`, and `DOCX` files.
- **Deep Parsing:** Tabular data from spreadsheets and visual layouts from slide decks are extracted and vectorized for high-fidelity retrieval.

### 3. Institutional AI Consultant
- **Grounded Responses:** An AI consultant persona that prioritizes your company's internal data over general knowledge.
- **Inline Citations:** Perplexity-style citation chips that link directly to the source document for every factual claim.
- **Hybrid Retrieval:** Combines semantic Vector search with Knowledge Graph structural traversal to provide deep context.

### 4. Dynamic AI-Generated Decks
- **Runtime Deck Creation:** Generates professional PowerPoint decks by dynamically writing and executing Python code at runtime.
- **Data-Driven:** Decks are built directly from the latest information in your knowledge base, ensuring accuracy for investor updates.

### 5. Secure Investor Sharing
- **Shareable Links:** Generate time-limited, read-only links for external stakeholders.
- **Investor View:** A dedicated public interface where investors can interact with the AI consultant without requiring a platform account.

---

## 🛠️ Tech Stack

### Core Foundation (MemoryOS)
- **Framework:** Next.js 14 (App Router)
- **AI Orchestration:** LangChain (Claude-3 / GPT-4)
- **Knowledge Graph:** React Flow (Visualization) & Recursive CTEs (Traversal)
- **Vector Search:** `pgvector` & Sentence-Transformers

### New Capabilities
- **Authentication:** Better Auth (with Organization plugin)
- **Document Ingestion:** `pdfplumber`, `python-pptx`, `openpyxl`, `python-docx`
- **Dynamic Decks:** Python-based runtime code execution
- **ORM:** Prisma (PostgreSQL)

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js v18+
- Python 3.10+
- PostgreSQL with `pgvector` and `uuid-ossp` extensions

### 2. Environment Setup
Create a `.env.local` (frontend) and `.env` (ai-service) file. You can find templates in the respective directories:
- [frontend/.env.example](frontend/.env.example)
- [ai-service/.env.example](ai-service/.env.example)

```env
# Example variables (refer to .env.example for full list)
DATABASE_URL="postgresql://user:pass@localhost:5432/dataroom"
BETTER_AUTH_SECRET="your_secret"
AI_PROVIDER="anthropic" 
```

### 3. Installation
```bash
# Frontend
cd frontend
npm install
npx prisma db push
npm run migrate:orgs # Initializes multi-tenant structure for existing data

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 4. Running Locally
```bash
# Terminal 1: AI Service
cd ai-service
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 📜 Credits & License
This project is an extension of the original [MemoryOS](https://github.com/CommonCapital/MemoryOS.git) by Common Capital.

MIT License - 2026 Data Room Team.
# Institutional-Memory

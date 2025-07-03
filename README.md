# i-WMS – Intelligent Warehouse Management System

A modern, AI-powered warehouse management platform with real-time analytics, Excel automation, and a beautiful, responsive UI.

---

## 🚀 At a Glance

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **FastAPI** backend for Excel analytics
- **AI Assistant** (LangChain.js, Gemini API)
- **Interactive Dashboards** (Recharts)
- **Elegant, glassmorphic UI**

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A["User"] -->|"Login"| B["Next.js Frontend"]
    B -->|"Excel Upload"| C["FastAPI Backend"]
    C -->|"Process Excel"| D["Pandas, OpenPyXL, XlsxWriter"]
    D -->|"Return Results"| B
    B -->|"Show Dashboard, Analytics, AI Assistant"| E["UI Components"]
    B -->|"AI Query"| F["LangChain.js / Gemini API"]
    F -->|"AI Insights"| B
    B -->|"Charts & KPIs"| G["Recharts"]
```

---

## 🖥️ Component Overview

```mermaid
graph LR
    subgraph Frontend
        A1["Login Page"]
        A2["Dashboard"]
        A3["Excel Processor"]
        A4["AI Assistant"]
        A5["Analytics"]
        A6["Sidebar & Navigation"]
    end
    subgraph Backend
        B1["FastAPI Server"]
        B2["Excel Analyzer (Pandas, OpenPyXL)"]
        B3["AI Engine (LangChain.js, Gemini API)"]
        B4["Vector Store (ChromaDB)"]
    end
    subgraph Data
        C1["Excel Files"]
        C2["Processed Reports"]
        C3["AI Knowledge Base"]
    end
    A1 -->|"User Auth"| A2
    A2 -->|"Upload Excel"| A3
    A3 -->|"POST /analyze-excel"| B1
    B1 -->|"Analyze"| B2
    B2 -->|"Save/Return"| C2
    A3 -->|"Show Results"| A2
    A4 -->|"Query"| B3
    B3 -->|"Retrieve"| B4
    B4 -->|"Vector Search"| C3
    B3 -->|"AI Response"| A4
    A5 -->|"Charts"| A2
    A6 -->|"Navigate"| A1
    A6 -->|"Navigate"| A2
    A6 -->|"Navigate"| A3
    A6 -->|"Navigate"| A4
    A6 -->|"Navigate"| A5
```

---

## 📊 System Component Distribution

```mermaid
pie
    title "System Component Distribution"
    "Frontend (Next.js, UI)" : 30
    "Backend (FastAPI, Python)" : 30
    "AI & Analytics" : 20
    "Excel Processing" : 15
    "DevOps & Deployment" : 5
```

---

## 🔄 Workflow Overview

```mermaid
flowchart TD
    subgraph "Frontend Workflow"
        A["User Login"] --> B["Session Context"]
        B --> C["Dashboard"]
        C --> D["Tab Navigation"]
        D --> E1["Excel Processor"]
        D --> E2["AI Assistant"]
        D --> E3["Analytics"]
    end
    subgraph "Backend Workflow"
        F["Excel Upload"] --> G["FastAPI Endpoint"]
        G --> H["Excel Analyzer"]
        H --> I["Processed Data"]
        I --> J["Return to Frontend"]
    end
    E1 --> F
    E2 --> K["AI Query"]
    K --> L["LangChain.js / Gemini API"]
    L --> M["AI Response"]
    M --> E2
    E3 --> N["Fetch Analytics Data"]
    N --> O["Backend API"]
    O --> P["Return Analytics"]
    P --> E3
```

---

## 📥 Excel Processing Pipeline

```mermaid
flowchart TD
    subgraph "Excel Processing"
        A["User Uploads Excel"] --> B["POST /api/analyze-excel"]
        B --> C["FastAPI Receives File"]
        C --> D["Pandas/OpenPyXL Process"]
        D --> E["RMS Algorithm"]
        E --> F["Generate Report"]
        F --> G["Return Processed File"]
        G --> H["Frontend Shows Result"]
    end
```

---

## 🤖 AI Assistant Query Flow

```mermaid
flowchart TD
    subgraph "AI Assistant"
        A["User Query"] --> B["Frontend Sends to API"]
        B --> C["LangChain.js"]
        C --> D["Gemini API"]
        D --> E["AI Response"]
        E --> F["Frontend Displays Answer"]
    end
```

---

## 📈 Analytics Data Flow

```mermaid
flowchart TD
    subgraph "Analytics"
        A["Frontend Requests Data"] --> B["Backend API"]
        B --> C["Fetch from DB/Excel"]
        C --> D["Return Analytics Data"]
        D --> E["Frontend Renders Charts"]
    end
```

---

## 🧩 Full System Process (Sequence Diagram)

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js App
    participant API as FastAPI Backend
    participant Excel as Excel Analyzer (Pandas, OpenPyXL)
    participant AI as AI Engine (LangChain.js, Gemini API)
    participant DB as Vector Store / Data

    User->>Frontend: Open App (Login)
    Frontend->>User: Show Login UI
    User->>Frontend: Submit Credentials
    Frontend->>Frontend: Validate/Login (Session)
    Frontend->>User: Show Dashboard (Sidebar, Tabs)
    User->>Frontend: Upload Excel File
    Frontend->>API: POST /api/analyze-excel (file)
    API->>Excel: Process Excel (RMS, Analysis)
    Excel-->>API: Return Results/Report
    API-->>Frontend: Send Processed Data
    Frontend->>User: Show Results, Download Link
    User->>Frontend: Ask AI Question
    Frontend->>AI: Send Query (LangChain.js, Gemini API)
    AI->>DB: Retrieve Context (Vector Search)
    DB-->>AI: Return Context
    AI-->>Frontend: AI Response
    Frontend->>User: Show AI Answer
    User->>Frontend: View Analytics Tab
    Frontend->>API: Request Analytics Data
    API->>Excel: Fetch/Compute Analytics
    Excel-->>API: Return Analytics
    API-->>Frontend: Send Analytics Data
    Frontend->>User: Render Charts, KPIs
```

---

## ⚡ Quickstart (CLI)

```mermaid
flowchart TD
    subgraph "How to Run (CLI Commands)"
        A["Clone Repo"] --> B["Install Frontend Deps"]
        B --> C["Install Backend Deps"]
        C --> D["Set Env Vars"]
        D --> E["Start Backend"]
        E --> F["Start Frontend"]
        F --> G["Open in Browser"]
    end
```

### 1. Clone & Install
```bash
# Clone repository
$ git clone <repository-url>
$ cd i-wms

# Install frontend dependencies
$ npm install

# Install backend dependencies
$ cd reference
$ pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy and edit environment variables
$ cp .env.example .env.local
# Edit .env.local with your API keys and backend URL
```

### 3. Run Backend
```bash
$ cd reference
$ python api_process.py
```

### 4. Run Frontend
```bash
$ cd ..
$ npm run dev
```

### 5. Open in Browser
Go to: [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

- **Login & Auth**: Secure, role-based access
- **Dashboard**: Real-time KPIs, charts, and system status
- **Excel Processor**: Drag & drop upload, RMS analysis, instant report download
- **AI Assistant**: Natural language queries, context-aware insights
- **Analytics**: Advanced charts, time filtering, exportable reports
- **Modern UI**: Sidebar, tab navigation, notifications, glassmorphism

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend**: FastAPI, Python, Pandas, OpenPyXL, XlsxWriter
- **AI**: LangChain.js, Gemini API, ChromaDB (optional)
- **DevOps**: Vercel, Docker, Railway, Fly.io

---

## 🧭 Project Structure

- `app/` – Next.js App Router (pages, layout, API)
- `components/` – UI components (Sidebar, Dashboard, etc.)
- `backend/` & `reference/` – FastAPI backend, Excel logic
- `public/` – Static assets (logo, favicon)
- `lib/` – Utility libraries (AI, Excel, vectorization)

---

## 📝 License

MIT License. See [LICENSE](LICENSE).

---

**@Robotjaol @Kambingturbo** 
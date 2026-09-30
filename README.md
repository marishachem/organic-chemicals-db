# 🧪 Organic Chemicals DB

A full-stack web application for searching, visualizing, and storing organic compounds. Built with FastAPI, React, RDKit, and SQLite.

## How It Works

```
┌─────────────────┐        HTTP        ┌──────────────────────┐
│  React Frontend │ ◄────────────────► │  FastAPI Backend     │
│  (Vite, port    │                    │  (Uvicorn, port 8000)│
│   3000)         │                    │                      │
│                 │                    │  RDKit — calculates  │
│  - SMILES input │                    │  molecular properties│
│  - 2D structure │                    │                      │
│    (RDKit.js)   │                    │  PubChem API —       │
│  - Properties   │                    │  searches by name    │
└─────────────────┘                    │                      │
                                       │  SQLite — saves your │
                                       │  compound library    │
                                       └──────────────────────┘
```

### User flow
1. Type a **SMILES string** (e.g. `C1CCCCC1` for cyclohexane) into the search box
2. The frontend sends it to `GET /compound/?smiles=...`
3. The backend validates it with RDKit and returns: formula, molecular weight, logP, H-bond donors/acceptors, TPSA
4. The frontend renders the **2D structure** directly in the browser using the RDKit WebAssembly library
5. Compounds can be **saved to a local SQLite database** and listed later

## Project Structure

```
organic-chemicals-db/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI routes
│   │   ├── models.py      # SQLAlchemy Compound model
│   │   ├── database.py    # SQLite connection & session
│   │   └── utils.py       # RDKit helper (mol → image)
│   └── requirements.txt
├── frontend/
│   └── chem-app/
│       ├── src/
│       │   ├── App.js           # Root component
│       │   ├── search.jsx       # Search UI + API calls
│       │   └── components/
│       │       └── RdkitMol.js  # 2D molecule renderer (WebAssembly)
│       ├── vite.config.js
│       └── package.json
├── docker-compose.yml     # PostgreSQL + Redis (optional, for production)
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/compound/?smiles=...` | Calculate properties from SMILES |
| `GET` | `/search-pubchem/?name=...` | Search PubChem by compound name |
| `GET` | `/compounds/` | List all saved compounds |
| `POST` | `/compounds/save?name=...&smiles=...` | Save a compound to the database |
| `DELETE` | `/compounds/{id}` | Delete a saved compound |

## Getting Started

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cd app
python3 -m uvicorn main:app --reload
```

API runs at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend/chem-app
npm install
npm start
```

App runs at `http://localhost:3000`

### Example SMILES to try

| Compound | SMILES |
|----------|--------|
| Cyclohexane | `C1CCCCC1` |
| Aspirin | `CC(=O)Oc1ccccc1C(=O)O` |
| Caffeine | `CN1C=NC2=C1C(=O)N(C(=O)N2C)C` |
| Ethanol | `CCO` |
| Benzene | `c1ccccc1` |

## Tech Stack

- **Backend**: Python, FastAPI, RDKit, SQLAlchemy, SQLite
- **Frontend**: React 18, Vite, RDKit.js (WebAssembly)
- **External API**: PubChem REST API

## What I Learned

- Building a REST API with FastAPI and SQLAlchemy
- Using RDKit for server-side cheminformatics (property calculation)
- Using RDKit compiled to WebAssembly for browser-side molecule rendering
- Integrating the PubChem REST API
- Full-stack architecture: React frontend ↔ Python backend
- SQLite for lightweight local persistence

# AI Bank Assistance

## Indic-LLaMA Integration (Optimized for Hindi & Marathi)

The assistant uses **Indic-LLaMA-7B**, an Indian-optimized language model for better Hindi and Marathi support.

### Setup Indic-LLaMA

1. First-time setup: Download Hugging Face model (1-2 GB):
   ```bash
   # Install transformers, torch, and dependencies
   pip install -r requirements.txt
   ```

2. Enable Indic-LLaMA before starting backend:
   ```powershell
   $env:INDIC_LLM_ENABLED="true"
   $env:INDIC_LLM_MODEL="ai4bharat/Indic-LLaMA-7B"
   $env:INDIC_LLM_DEVICE="cpu"  # Use "cuda" if GPU is available
   ```

3. Run backend normally (model loads on first request):
   ```bash
   python app.py
   ```

### Optional: GPU Acceleration

If you have NVIDIA GPU:
```powershell
$env:INDIC_LLM_DEVICE="cuda"
pip install --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Without Indic-LLaMA

If you skip enabling it, the assistant still works with deterministic responses (no model needed). 

---

AI Bank Assistance is a multilingual banking assistant that answers account and FAQ queries in English, Hindi, and Marathi.

It combines:
- Retrieval over banking FAQ data using embeddings (ChromaDB + sentence-transformers)
- Rule/intention handling for account details and transaction summaries
- Flask APIs for login, chat, and text-to-speech
- Two UI options:
  - Server-rendered web UI in `web/`
  - React + Vite frontend in `frontend/`

## Project Details

### Core capabilities
- Mobile-number-based login using local demo user data
- Personalized answers using user, account, and transaction JSON datasets
- Language detection (`en`, `hi`, `mr`) and language-aware responses
- Text-to-speech response audio via gTTS
- FAQ retrieval powered by vector search over embedded content

### Main modules
- `app.py`: Flask backend and API routes
- `data/`: source JSON data (`users`, `accounts`, `transactions`, `general`)
- `embeddings/search.py`: intent + vector retrieval pipeline
- `embeddings/create_embeddings.py`: script to create/update embeddings in ChromaDB
- `web/`: Flask template/static UI
- `frontend/`: React + Vite UI (dev server + API proxy)

### API endpoints
- `GET /api/health`
- `POST /api/login`
- `POST /api/logout`
- `POST /api/chat`
- `POST /api/tts`

## Setup Info

### 1) Prerequisites
- Python 3.10+ (recommended)
- Node.js 18+ (only for React frontend)
- pip

### 2) Clone project
```bash
git clone https://github.com/Rohit-TecH306/CodeApex_2.0.git
cd CodeApex_2.0
```

### 3) Create and activate Python virtual environment

Windows (PowerShell):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:
```bash
python -m venv .venv
source .venv/bin/activate
```

### 4) Install backend dependencies
```bash
pip install -r requirements.txt
```

### 5) Build or refresh embeddings (first time or after data changes)
```bash
python embeddings/create_embeddings.py
```

This creates/updates vector data under `embeddings/db/`.

### 6) Run backend (Flask)
```bash
python app.py
```

Backend runs at: `http://127.0.0.1:5000`

### 7) Run UI

Option A: Flask web UI
- Open: `http://127.0.0.1:5000`

Option B: React frontend
```bash
cd frontend
npm install
npm run dev
```
- Open: `http://127.0.0.1:3000`
- Vite proxy forwards `/api` calls to `http://127.0.0.1:5000`

## Demo Login

Use any mobile number from `data/users.json`.
Example:
- `9000007124`

## Notes
- Set a stronger secret key in production:
  - Environment variable: `BANK_ASSISTANT_SECRET`
- Keep `embeddings/db/` out of git if you want smaller repository size for deployment workflows.

## Troubleshooting

- Login fails:
  - Make sure mobile exists in `data/users.json`
- Chat fails on startup:
  - Ensure dependencies installed and embeddings are created
- TTS fails:
  - Check network availability for gTTS and retry
- React app cannot reach backend:
  - Ensure Flask is running on port `5000`

## Future Improvements
- Real authentication and OTP flow
- Role-based banking workflows
- Better observability and API logging
- Dockerized deployment

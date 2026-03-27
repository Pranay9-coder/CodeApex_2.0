# Embeddings Module

This module handles vector indexing and FAQ retrieval using ChromaDB and sentence-transformers.

## Purpose
- Build embeddings from banking FAQ/data
- Retrieve semantically similar answers for user queries
- Support multilingual response flow with backend integration

## Setup

Use project root Python environment:
```bash
pip install -r requirements.txt
```

## Create/Refresh Embeddings

From project root:
```bash
python embeddings/create_embeddings.py
```

Vector store location:
- `embeddings/db/`

## Quick Check

Run backend and ask FAQ-style questions via `/api/chat` to validate retrieval.

## Optional LLM Refinement

The search pipeline can optionally refine responses for better Hindi/Marathi fluency.

### Recommended: Gemini

Set these environment variables before running backend:

```powershell
$env:GEMINI_ENABLED="true"
$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
$env:GEMINI_MODEL="gemini-1.5-flash"
```

### Optional: Indic-LLaMA-7B

```powershell
$env:INDIC_LLM_ENABLED="true"
$env:INDIC_LLM_MODEL="ai4bharat/Indic-LLaMA-7B"
$env:INDIC_LLM_DEVICE="cpu"   # or "cuda"
```

If both are configured, Gemini is used first and Indic-LLaMA is used as fallback.

## Offline Verification

To force offline mode:

```powershell
$env:GEMINI_ENABLED="false"
$env:INDIC_LLM_ENABLED="true"
```

After running backend, verify runtime mode from:
- `/api/model-status`

You should see:
- `configured_mode: indic-llama`

# Frontend (React + Vite)

This is the React frontend for AI Bank Assistance.

## Local Setup

From project root:
```bash
cd frontend
npm install
npm run dev
```

App URL:
- `http://127.0.0.1:3000`

## Backend Requirement

The frontend expects backend APIs at `/api`.

In development, Vite proxy forwards `/api` to:
- `http://127.0.0.1:5000`

So run backend first:
```bash
python app.py
```

## Build
```bash
npm run build
npm run preview
```

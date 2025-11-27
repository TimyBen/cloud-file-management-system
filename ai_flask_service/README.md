<<<<<<< HEAD
# cloud-file-management-system
Intelligent Cloud File Management &amp; Collaboration Platform (Nest.js + Flask + Svelte + AWS)

# 🌩️ Cloud File Management System

An **Intelligent Cloud File Management & Collaboration Platform** built with:
- **Backend:** Nest.js + PostgreSQL (AWS RDS) + DynamoDB + S3 + WebSockets
- **Frontend:** Svelte + Tailwind CSS
- **AI Module:** Flask (Python) for anomaly detection and lifecycle prediction

## 🧠 Features
- Secure file upload/download with S3
- Real-time collaboration via WebSocket + DynamoDB
- Role-based access control (RBAC)
- AI-driven activity analytics
- Compliance & lifecycle management

## ⚙️ Tech Stack
- **Backend:** Nest.js (TypeORM, AWS SDK)
- **Frontend:** Svelte (Vite + TailwindCSS)
- **Database:** PostgreSQL (RDS) + DynamoDB
- **Cloud Provider:** AWS
=======
# ai_flask_service

Lightweight Flask microservice for AI inference (Hugging Face / PyTorch integration).
This package includes:
- `app.py` Flask app with `/health`, `/predict` and `/embed` endpoints
- `model.py` model loader using Hugging Face `transformers` (text-classification) and optional sentence-transformers for embeddings
- `requirements.txt` listing dependencies
- `run_dev.sh` automated dev script to start Flask and (optionally) your Nest backend
- `start_flask_venv.sh` helper to create & activate venv and run flask (macOS-friendly)
- `.env.example` example environment variables

## Notes
- The default model is `distilbert-base-uncased-finetuned-sst-2-english` for sentiment classification.
- Embeddings endpoint requires `sentence-transformers` and is optional — see below.
- These models are downloaded from Hugging Face on first run (internet connection required).
- CPU-only Mac installs can be slow; prefer a machine with more RAM.
>>>>>>> a3f63a8 (flask integration.)

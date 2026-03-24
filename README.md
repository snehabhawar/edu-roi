# EduROI

### Is Your Degree Really Worth It?

[![Frontend](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)]()
[![ML](https://img.shields.io/badge/ML-Scikit--Learn-orange?logo=scikit-learn)]()
[![Deployment](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)]()
[![API](https://img.shields.io/badge/API-Railway-purple?logo=railway)]()

A full-stack machine learning web application that predicts graduate salaries, calculates student debt ROI, and maps immigration pathways across 5 countries.

---

## Overview

Choosing where to study abroad is one of the biggest financial decisions a student makes — yet most decisions are based on guesswork.

**EduROI changes that.**

It uses machine learning trained on real government datasets to help students evaluate:

- Expected post-graduation salary  
- Total cost of education (tuition + living)  
- Debt burden and repayment timeline  
- ROI score (out of 100)  
- 10-year earnings projection  
- Immigration / PR pathways  

---

## Live Demo

- Frontend: https://your-vercel-url.vercel.app  
- API Docs: https://your-railway-url.up.railway.app/docs  

---

## Screenshots

_Add screenshots here after deployment_

---

## Tech Stack

### Frontend
- Next.js 14 + TypeScript  
- Tailwind CSS  
- WebGL (OGL, COBE)  
- Vercel  

### Backend
- FastAPI  
- scikit-learn (Gradient Boosting Regressor)  
- pandas  
- numpy  
- Pydantic v2  
- Railway  

---

## Machine Learning Model

### Algorithm
Gradient Boosting Regressor

Chosen over linear regression because salary data is highly non-linear and depends on interactions between country, field of study, and university tier.

---

### Training Data

12,000 synthetic samples generated from real government sources:

- US — NCES  
- UK — HESA  
- Germany — Destatis  
- Australia — ABS  
- India — NIRF  

---

### Performance

- R² Score: 0.8935  
- MAE: $6,023  
- Features: 10  

---

## ROI Scoring Model


ROI Score = (Salary Score × 0.35)
+ (Low Debt Score × 0.30)
+ (Job Demand Score × 0.20)
+ (Career Growth Score × 0.15)


---

## Salary Multipliers (Graduate Degrees)

| Field              | Multiplier |
|-------------------|-----------|
| Law               | 1.40×     |
| Business          | 1.35×     |
| Computer Science  | 1.28×     |
| Engineering       | 1.25×     |
| Psychology        | 1.22×     |
| Medicine          | 1.20×     |
| Education         | 1.18×     |
| Liberal Arts      | 1.18×     |
| Design & Arts     | 1.15×     |
| Nursing           | 1.12×     |

---

## Project Structure


edu-roi/
├── frontend/ # Next.js application
├── backend/ # FastAPI + ML backend
└── README.md


---

## API Reference

### POST `/roi/compare`

Compare ROI across multiple countries.

**Request**
```json
{
  "major": "cs",
  "countries": ["us", "uk", "de", "au", "in"],
  "tier": "mid",
  "duration_years": 4,
  "aid_pct": 20
}
POST /pr/pathways

Get immigration pathway insights per country.

GET /health

Health check endpoint.

---

**Backend Setup**

cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

python -m app.ml.train
uvicorn app.main:app --reload

API runs at: http://localhost:8000

Docs: http://localhost:8000/docs

**Frontend Setup**

cd frontend

npm install
npm run dev

App runs at: http://localhost:3000

**Deployment**

Backend (Railway)
Root directory: backend

Start command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT

Frontend (Vercel)
Root directory: frontend

Environment variable:
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app

*Key Engineering Decisions*

Why Gradient Boosting?

Captures non-linear salary patterns across countries and majors better than linear models.

Why WebGL?

Creates a more engaging user experience and differentiates the project visually.

Why Input Validation?

Prevents invalid inputs using:

Client-side clamping
Server-side validation (Pydantic)

**Why This Project Matters**

Students often:

Underestimate debt
Overestimate salaries
Ignore immigration constraints

*EduROI helps turn a high-risk decision into a data-driven one.*

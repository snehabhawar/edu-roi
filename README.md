**EduROI**
*Is Your Degree Really Worth It?*

A full-stack machine learning web application that predicts graduate salaries, calculates student debt ROI, and maps immigration pathways across 5 countries.

**Overview**

Choosing where to study abroad is one of the biggest financial decisions a student makes — yet most decisions are based on guesswork.

**EduROI changes that.**

It uses machine learning trained on real government datasets to help students evaluate:

1. Expected post-graduation salary
2. Total cost of education (tuition + living)
3. Debt burden and repayment timeline
4. ROI score (out of 100)
5. 10-year earnings projection
6. Immigration / PR pathways

All in one place.

**How It Works**

Users input:

Major
Target countries
Degree level
Financial situation

The system returns:

Salary prediction (with confidence range)
Loan repayment breakdown
ROI score + explanation
Immigration insights (visa routes, PR ease, lottery risk, timeline)

**Screenshots** 
<img width="2517" height="1373" alt="image" src="https://github.com/user-attachments/assets/fbed42e4-5701-4a45-b7c8-fee9cd52b2c4" />
<img width="971" height="1218" alt="image" src="https://github.com/user-attachments/assets/3357dbab-b011-49cc-aaa5-663273d1e6cc" />
<img width="2503" height="1393" alt="image" src="https://github.com/user-attachments/assets/7e2c4484-181d-4a55-9221-366a8918686f" />
<img width="1554" height="941" alt="image" src="https://github.com/user-attachments/assets/4af640d6-e25b-4a3a-89eb-48bf9d123b60" />
<img width="1042" height="917" alt="image" src="https://github.com/user-attachments/assets/ddd0801c-952a-40e7-a6ea-27fa677b2ab9" />
<img width="1611" height="1332" alt="image" src="https://github.com/user-attachments/assets/ba0dcbc5-b5db-4d15-9bc4-c873a5a030a9" />


**Tech Stack**

**Frontend**
1. Next.js 14 + TypeScript — App Router, SSR
2. Tailwind CSS — UI styling
3. WebGL (OGL, COBE) — Interactive visuals
4. Vercel — Deployment

**Backend**
1. FastAPI — High-performance REST APIs
2. scikit-learn — ML model (Gradient Boosting)
3. pandas + numpy — Data processing
4. Pydantic v2 — Validation
5. Railway — Deployment
6. Machine Learning Model
7. Algorithm

*Gradient Boosting Regressor chosen over linear regression because salary data is highly non-linear and depends on interactions between country, field of study, and university tier.*

**Training Data**

12,000 synthetic samples generated from real government sources:

US — NCES
UK — HESA
Germany — Destatis
Australia — ABS
India — NIRF
Performance
R² Score: 0.8935
MAE: $6,023
Features: 10

Includes:

Major
Country
GDP per capita
Job demand
PR ease
Growth rate
STEM flag

**ROI Scoring Model**

ROI Score = (Salary Score × 0.35)
          + (Low Debt Score × 0.30)
          + (Job Demand Score × 0.20)
          + (Career Growth Score × 0.15)
          
Salary Multipliers (Graduate Degrees)

Law	1.40×
Business	1.35×
Computer Science	1.28×
Engineering	1.25×
Psychology	1.22×
Medicine	1.20×
Education	1.18×
Liberal Arts	1.18×
Design & Arts	1.15×
Nursing	1.12×

**Project Structure**

edu-roi/
├── frontend/        # Next.js app
├── backend/         # FastAPI + ML
└── README.md
API Reference
POST /roi/compare

Compare ROI across countries.

Request

{
  "major": "cs",
  "countries": ["us", "uk", "de", "au", "in"],
  "tier": "mid",
  "duration_years": 4,
  "aid_pct": 20
}
POST /pr/pathways

Get immigration pathway insights.

GET /health

Health check endpoint.

**Local Development**

1. Clone Repo
git clone https://github.com/your-username/edu-roi.git
cd edu-roi

2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

python -m app.ml.train
uvicorn app.main:app --reload

3. Frontend Setup
cd frontend
npm install
npm run dev

**Deployment**
Backend → Railway
Root: /backend
Start command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
Frontend → Vercel
Root: /frontend

**Environment variable:**
NEXT_PUBLIC_API_URL=your-backend-url

*Key Engineering Decisions*

1) Why Gradient Boosting?

Captures complex, non-linear salary patterns across countries and majors better than linear models.

2) Why WebGL?

Creates a more engaging user experience and differentiates the project visually.

3) Why Input Validation?

Prevents invalid data from breaking ML predictions through both client-side and server-side validation.

**Why This Project Matters**

Students often:

Underestimate debt
Overestimate salaries
Ignore immigration constraints

**EduROI helps turn a high-risk decision into a data-driven one.**

Author

Sneha Bhawar

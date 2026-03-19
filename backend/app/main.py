from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import roi, pr

app = FastAPI(title="EduROI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://edu-roi.vercel.app/",
        "https://edu-roi-production.up.railway.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roi.router)
app.include_router(pr.router)

@app.get("/health")
def health():
    return {"status": "ok"}
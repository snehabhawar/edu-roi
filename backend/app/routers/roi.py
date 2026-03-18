from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal, Optional
from app.models.schemas import ROIResult, ROIScores
from app.ml.predictor import compute_roi

router = APIRouter(prefix="/roi", tags=["ROI"])

Country  = Literal["us","uk","de","au","in"]
Major    = Literal["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]
Tier     = Literal["top","mid","low"]
DegLevel = Literal["undergraduate","graduate"]

# Default tuition per country per tier (local currency)
DEFAULT_TUITION = {
    "us": {"top":52000,  "mid":28000,  "low":8000},
    "uk": {"top":9250,   "mid":9250,   "low":9250},
    "de": {"top":500,    "mid":300,    "low":0},
    "au": {"top":45000,  "mid":32000,  "low":18000},
    "in": {"top":300000, "mid":120000, "low":40000},
}
DEFAULT_LIVING = {
    "us": {"campus":16000, "off":13000, "home":5000},
    "uk": {"campus":11000, "off":9500,  "home":4000},
    "de": {"campus":9600,  "off":8400,  "home":3000},
    "au": {"campus":15000, "off":13000, "home":5000},
    "in": {"campus":180000,"off":150000,"home":60000},
}
FX = {"us":1.0, "uk":1.263, "de":1.086, "au":0.648, "in":0.012}
LOAN = {
    "us": {"rate":0.065, "years":10},
    "uk": {"rate":0.062, "years":30},
    "de": {"rate":0.040, "years":10},
    "au": {"rate":0.000, "years":0},
    "in": {"rate":0.085, "years":7},
}
GRAD_TUITION_BOOST = 1.35

class CompareRequest(BaseModel):
    major:          Major
    countries:      list[Country] = Field(default=["us","uk","de","au","in"], min_length=2, max_length=5)
    tier:           Tier   = "mid"
    duration_years: int    = Field(4, ge=1, le=6)
    aid_pct:        float  = Field(20, ge=0, le=100)
    living:         Literal["campus","off","home"] = "off"
    degree_level:   DegLevel = "undergraduate"
    # Optional user overrides — -1 means "use defaults"
    custom_tuition_usd: Optional[float] = Field(default=-1)
    custom_living_usd:  Optional[float] = Field(default=-1)

def _build(country: str, req: CompareRequest) -> ROIResult:
    fx       = FX[country]
    loan     = LOAN[country]

    # Resolve tuition
    if req.custom_tuition_usd is not None and req.custom_tuition_usd >= 0:
        # User supplied USD — convert to local currency
        tuition_local = req.custom_tuition_usd / fx
    else:
        tuition_local = DEFAULT_TUITION[country][req.tier]
        if req.degree_level == "graduate":
            tuition_local = int(tuition_local * GRAD_TUITION_BOOST)

    # Resolve living cost
    if req.custom_living_usd is not None and req.custom_living_usd >= 0:
        living_local = req.custom_living_usd / fx
    else:
        living_local = DEFAULT_LIVING[country][req.living]

    r  = compute_roi(
        major=req.major, country=country, tier=req.tier,
        duration_years=req.duration_years,
        annual_tuition_local=tuition_local,
        aid_fraction=req.aid_pct / 100,
        annual_living_local=living_local,
        fx_to_usd=fx,
        loan_rate=loan["rate"],
        loan_years=loan["years"],
        degree_level=req.degree_level,
    )
    sc = r["scores"]
    return ROIResult(
        country=country, major=req.major, tier=req.tier,
        salary_usd=r["salary_usd"], salary_p25_usd=r["salary_p25_usd"],
        salary_p75_usd=r["salary_p75_usd"], total_cost_usd=r["total_cost_usd"],
        debt_usd=r["debt_usd"], monthly_payment_usd=r["monthly_payment_usd"],
        payoff_years=r["payoff_years"], earn_10yr_usd=r["earn_10yr_usd"],
        net_10yr_usd=r["net_10yr_usd"],
        scores=ROIScores(roi=sc["roi"], salary=sc["salary"], debt=sc["debt"],
                         demand=sc["demand"], growth=sc["growth"]),
    )

@router.post("/compare", response_model=list[ROIResult])
def compare_roi(req: CompareRequest):
    results = []
    for country in req.countries:
        try:
            results.append(_build(country, req))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"{country}: {e}")
    return results
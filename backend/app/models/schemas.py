from typing import Literal
from pydantic import BaseModel, Field

Country   = Literal["us","uk","de","au","in"]
Major     = Literal["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]
Tier      = Literal["top","mid","low"]
Origin    = Literal["in","cn","ph","ng","br","other"]
DegLevel  = Literal["undergraduate","graduate"]

class CompareRequest(BaseModel):
    major:          Major
    countries:      list[Country] = Field(default=["us","uk","de","au","in"], min_length=2, max_length=5)
    tier:           Tier     = "mid"
    duration_years: int      = Field(4, ge=1, le=6)
    aid_pct:        float    = Field(20, ge=0, le=100)
    living:         Literal["campus","off","home"] = "off"
    degree_level:   DegLevel = "undergraduate"

class PRRequest(BaseModel):
    major:        Major
    countries:    list[Country] = Field(default=["us","uk","de","au","in"], min_length=1)
    origin:       Origin   = "in"
    degree_level: DegLevel = "undergraduate"

class ROIScores(BaseModel):
    roi:int; salary:int; debt:int; demand:int; growth:int

class ROIResult(BaseModel):
    country:str; major:str; tier:str
    salary_usd:int; salary_p25_usd:int; salary_p75_usd:int
    total_cost_usd:int; debt_usd:int; monthly_payment_usd:int
    payoff_years:float; earn_10yr_usd:int; net_10yr_usd:int
    scores:ROIScores

class PRPathway(BaseModel):
    country:str; visa_path:str; post_study_work_years:float
    pr_timeline:str; has_lottery:bool; min_salary:str
    residency_req:str; citizenship:str
    ease_score:int; ease_label:str; is_priority_major:bool; notes:str

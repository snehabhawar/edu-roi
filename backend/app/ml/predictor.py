"""Loads the trained model and makes salary + ROI predictions."""
import os, json
import pandas as pd
import joblib
from functools import lru_cache

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

# Graduate salary boost per major
GRAD_SALARY_BOOST = {
    "cs":1.28,"engineering":1.25,"medicine":1.20,"business":1.35,
    "nursing":1.12,"law":1.40,"psychology":1.22,"education":1.18,
    "arts":1.15,"english":1.18,
}

@lru_cache(maxsize=1)
def load_artifacts():
    model      = joblib.load(f"{ARTIFACT_DIR}/salary_model.pkl")
    le_major   = joblib.load(f"{ARTIFACT_DIR}/le_major.pkl")
    le_country = joblib.load(f"{ARTIFACT_DIR}/le_country.pkl")
    with open(f"{ARTIFACT_DIR}/model_meta.json") as f:
        meta = json.load(f)
    return model, le_major, le_country, meta

def predict_salary(major: str, country: str, tier: str, degree_level: str = "undergraduate") -> dict:
    model, le_major, le_country, meta = load_artifacts()
    mf  = meta["major_features"][major]
    cf  = meta["country_features"][country]
    te  = meta["tiers"][tier]
    maj = int(le_major.transform([major])[0])
    cnt = int(le_country.transform([country])[0])
    X = pd.DataFrame([[maj, cnt, te,
                       mf["demand"], mf["growth_pct"], mf["stem"], mf["professional"],
                       cf["gdp_per_capita"], cf["gini"], cf["pr_ease"]]],
                     columns=meta["features"])
    val = model.predict(X)[0]

    # Apply graduate multiplier
    if degree_level == "graduate":
        boost = GRAD_SALARY_BOOST.get(major, 1.20)
        val   = val * boost

    return {
        "median": round(val),
        "p25":    round(val * 0.82),
        "p75":    round(val * 1.22),
    }

def compute_roi(major, country, tier, duration_years, annual_tuition_local,
                aid_fraction, annual_living_local, fx_to_usd,
                loan_rate, loan_years, degree_level="undergraduate") -> dict:

    sal     = predict_salary(major, country, tier, degree_level)
    sal_usd = sal["median"]
    net_t   = annual_tuition_local * (1 - aid_fraction)
    tc_usd  = round((net_t + annual_living_local) * duration_years * fx_to_usd)
    debt_usd = round(net_t * duration_years * 0.6 * fx_to_usd)

    monthly = 0
    if loan_rate > 0 and debt_usd > 0:
        r = loan_rate / 12; n = loan_years * 12
        monthly = round((debt_usd * r * (1+r)**n) / ((1+r)**n - 1))
    elif debt_usd > 0:
        monthly = round(sal_usd * 0.04 / 12)

    payoff  = round(debt_usd / (sal_usd * 0.9), 1) if sal_usd > 0 else 99
    earn10  = round(sum(sal_usd * (1.03**i) for i in range(1, 11)))

    _, _, _, meta = load_artifacts()
    mf     = meta["major_features"][major]
    sal_s  = min(100, round((sal_usd / 110000) * 100))
    debt_s = min(100, max(0, round(100 - (debt_usd / 80000) * 100)))
    dem_s  = mf["demand"]
    grw_s  = min(100, round(mf["growth_pct"] * 3.5))
    roi_s  = round(sal_s*0.35 + debt_s*0.30 + dem_s*0.20 + grw_s*0.15)

    return {
        "salary_usd": sal_usd, "salary_p25_usd": sal["p25"], "salary_p75_usd": sal["p75"],
        "total_cost_usd": tc_usd, "debt_usd": debt_usd, "monthly_payment_usd": monthly,
        "payoff_years": payoff, "earn_10yr_usd": earn10, "net_10yr_usd": earn10 - debt_usd,
        "scores": {"roi":roi_s,"salary":sal_s,"debt":debt_s,"demand":dem_s,"growth":grw_s},
    }

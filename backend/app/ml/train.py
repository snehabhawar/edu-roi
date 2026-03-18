"""
Train the salary prediction model.
Run: python -m app.ml.train
"""
import os, json
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

SALARY_MEDIANS = {
    ("cs","us","top"):128000, ("cs","us","mid"):110000, ("cs","us","low"):88000,
    ("cs","uk","top"):58000,  ("cs","uk","mid"):53000,  ("cs","uk","low"):42000,
    ("cs","de","top"):68000,  ("cs","de","mid"):63000,  ("cs","de","low"):52000,
    ("cs","au","top"):72000,  ("cs","au","mid"):58000,  ("cs","au","low"):48000,
    ("cs","in","top"):18000,  ("cs","in","mid"):8400,   ("cs","in","low"):4800,
    ("engineering","us","top"):112000, ("engineering","us","mid"):96000,  ("engineering","us","low"):78000,
    ("engineering","uk","top"):52000,  ("engineering","uk","mid"):45000,  ("engineering","uk","low"):36000,
    ("engineering","de","top"):65000,  ("engineering","de","mid"):60000,  ("engineering","de","low"):50000,
    ("engineering","au","top"):68000,  ("engineering","au","mid"):53000,  ("engineering","au","low"):44000,
    ("engineering","in","top"):14000,  ("engineering","in","mid"):6600,   ("engineering","in","low"):3600,
    ("medicine","us","top"):88000,  ("medicine","us","mid"):75000,  ("medicine","us","low"):62000,
    ("medicine","uk","top"):46000,  ("medicine","uk","mid"):40000,  ("medicine","uk","low"):33000,
    ("medicine","de","top"):62000,  ("medicine","de","mid"):57000,  ("medicine","de","low"):48000,
    ("medicine","au","top"):65000,  ("medicine","au","mid"):47000,  ("medicine","au","low"):38000,
    ("medicine","in","top"):12000,  ("medicine","in","mid"):7200,   ("medicine","in","low"):4200,
    ("business","us","top"):90000,  ("business","us","mid"):72000,  ("business","us","low"):55000,
    ("business","uk","top"):48000,  ("business","uk","mid"):40000,  ("business","uk","low"):30000,
    ("business","de","top"):56000,  ("business","de","mid"):50000,  ("business","de","low"):40000,
    ("business","au","top"):58000,  ("business","au","mid"):44000,  ("business","au","low"):34000,
    ("business","in","top"):10000,  ("business","in","mid"):5760,   ("business","in","low"):3000,
    ("nursing","us","top"):85000,  ("nursing","us","mid"):77000,  ("nursing","us","low"):64000,
    ("nursing","uk","top"):40000,  ("nursing","uk","mid"):38000,  ("nursing","uk","low"):30000,
    ("nursing","de","top"):48000,  ("nursing","de","mid"):43000,  ("nursing","de","low"):36000,
    ("nursing","au","top"):58000,  ("nursing","au","mid"):47000,  ("nursing","au","low"):38000,
    ("nursing","in","top"):6000,   ("nursing","in","mid"):4200,   ("nursing","in","low"):2400,
    ("law","us","top"):100000, ("law","us","mid"):80000,  ("law","us","low"):58000,
    ("law","uk","top"):55000,  ("law","uk","mid"):48000,  ("law","uk","low"):36000,
    ("law","de","top"):60000,  ("law","de","mid"):54000,  ("law","de","low"):44000,
    ("law","au","top"):65000,  ("law","au","mid"):49000,  ("law","au","low"):38000,
    ("law","in","top"):10000,  ("law","in","mid"):6000,   ("law","in","low"):3200,
    ("psychology","us","top"):58000,  ("psychology","us","mid"):48000,  ("psychology","us","low"):38000,
    ("psychology","uk","top"):36000,  ("psychology","uk","mid"):33000,  ("psychology","uk","low"):26000,
    ("psychology","de","top"):44000,  ("psychology","de","mid"):39000,  ("psychology","de","low"):32000,
    ("psychology","au","top"):46000,  ("psychology","au","mid"):36000,  ("psychology","au","low"):28000,
    ("psychology","in","top"):5000,   ("psychology","in","mid"):3000,   ("psychology","in","low"):1800,
    ("education","us","top"):52000,  ("education","us","mid"):44000,  ("education","us","low"):36000,
    ("education","uk","top"):40000,  ("education","uk","mid"):35000,  ("education","uk","low"):28000,
    ("education","de","top"):48000,  ("education","de","mid"):41000,  ("education","de","low"):34000,
    ("education","au","top"):52000,  ("education","au","mid"):40000,  ("education","au","low"):32000,
    ("education","in","top"):5500,   ("education","in","mid"):3360,   ("education","in","low"):2000,
    ("arts","us","top"):62000,  ("arts","us","mid"):51000,  ("arts","us","low"):38000,
    ("arts","uk","top"):34000,  ("arts","uk","mid"):30000,  ("arts","uk","low"):24000,
    ("arts","de","top"):42000,  ("arts","de","mid"):37000,  ("arts","de","low"):29000,
    ("arts","au","top"):44000,  ("arts","au","mid"):34000,  ("arts","au","low"):26000,
    ("arts","in","top"):6000,   ("arts","in","mid"):3600,   ("arts","in","low"):2000,
    ("english","us","top"):56000,  ("english","us","mid"):46000,  ("english","us","low"):34000,
    ("english","uk","top"):36000,  ("english","uk","mid"):32000,  ("english","uk","low"):25000,
    ("english","de","top"):40000,  ("english","de","mid"):36000,  ("english","de","low"):28000,
    ("english","au","top"):44000,  ("english","au","mid"):35000,  ("english","au","low"):26000,
    ("english","in","top"):4500,   ("english","in","mid"):2640,   ("english","in","low"):1500,
}

MAJOR_FEATURES = {
    "cs":          {"demand":95,"growth_pct":25,"stem":1,"professional":0},
    "engineering": {"demand":88,"growth_pct":18,"stem":1,"professional":0},
    "medicine":    {"demand":92,"growth_pct":20,"stem":1,"professional":1},
    "business":    {"demand":75,"growth_pct":12,"stem":0,"professional":0},
    "nursing":     {"demand":92,"growth_pct":22,"stem":1,"professional":1},
    "law":         {"demand":65,"growth_pct":14,"stem":0,"professional":1},
    "psychology":  {"demand":60,"growth_pct":10,"stem":0,"professional":0},
    "education":   {"demand":70,"growth_pct":8, "stem":0,"professional":1},
    "arts":        {"demand":50,"growth_pct":13,"stem":0,"professional":0},
    "english":     {"demand":45,"growth_pct":7, "stem":0,"professional":0},
}

COUNTRY_FEATURES = {
    "us": {"gdp_per_capita":80000,"gini":0.39,"pr_ease":45},
    "uk": {"gdp_per_capita":46000,"gini":0.35,"pr_ease":70},
    "de": {"gdp_per_capita":52000,"gini":0.32,"pr_ease":78},
    "au": {"gdp_per_capita":65000,"gini":0.33,"pr_ease":82},
    "in": {"gdp_per_capita":2500, "gini":0.35,"pr_ease":100},
}

TIER_ENC = {"top":2,"mid":1,"low":0}
FEATURES  = ["major_enc","country_enc","tier_encoded","demand","growth_pct","stem","professional","gdp_per_capita","gini","pr_ease"]

def generate_data(n=80):
    rng = np.random.default_rng(42)
    rows = []
    for (major,country,tier), median in SALARY_MEDIANS.items():
        mf = MAJOR_FEATURES[major]
        cf = COUNTRY_FEATURES[country]
        for _ in range(n):
            salary = max(1000, median * rng.lognormal(0, 0.18))
            rows.append({"major":major,"country":country,"tier":tier,
                         "tier_encoded":TIER_ENC[tier],
                         "demand":mf["demand"],"growth_pct":mf["growth_pct"],
                         "stem":mf["stem"],"professional":mf["professional"],
                         "gdp_per_capita":cf["gdp_per_capita"],"gini":cf["gini"],
                         "pr_ease":cf["pr_ease"],"salary_usd":round(salary)})
    return pd.DataFrame(rows)

def train():
    print("── EDU·ROI Salary Model Training ──────────────────")
    print("\n[1/3] Generating training data...")
    df = generate_data()
    print(f"      {len(df):,} samples across {df['major'].nunique()} majors × {df['country'].nunique()} countries × {df['tier'].nunique()} tiers")

    le_major   = LabelEncoder()
    le_country = LabelEncoder()
    df["major_enc"]   = le_major.fit_transform(df["major"])
    df["country_enc"] = le_country.fit_transform(df["country"])

    X = df[FEATURES]
    y = df["salary_usd"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("\n[2/3] Training Gradient Boosting model...")
    model = GradientBoostingRegressor(n_estimators=300, learning_rate=0.05, max_depth=5, subsample=0.8, random_state=42)
    model.fit(X_train, y_train)
    mae = mean_absolute_error(y_test, model.predict(X_test))
    r2  = r2_score(y_test, model.predict(X_test))
    print(f"  MAE:  ${mae:,.0f}")
    print(f"  R²:   {r2:.4f}")

    print("\n[3/3] Saving artifacts...")
    out = os.path.join(os.path.dirname(__file__), "artifacts")
    os.makedirs(out, exist_ok=True)
    joblib.dump(model,      f"{out}/salary_model.pkl")
    joblib.dump(le_major,   f"{out}/le_major.pkl")
    joblib.dump(le_country, f"{out}/le_country.pkl")
    with open(f"{out}/model_meta.json","w") as f:
        json.dump({"features":FEATURES,"major_features":MAJOR_FEATURES,"country_features":COUNTRY_FEATURES,"tiers":TIER_ENC}, f, indent=2)
    print(f"  Artifacts saved to {out}/")
    print("\n✓ Training complete.")

if __name__ == "__main__":
    train()

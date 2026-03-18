import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.predictor import predict_salary

client = TestClient(app)

class TestPredictor:
    def test_cs_us_salary_range(self):
        r = predict_salary("cs", "us", "mid")
        assert 60000 < r["median"] < 180000

    def test_india_lower_than_us(self):
        assert predict_salary("cs","in","mid")["median"] < predict_salary("cs","us","mid")["median"]

    def test_top_tier_beats_low(self):
        assert predict_salary("cs","uk","top")["median"] >= predict_salary("cs","uk","low")["median"]

class TestROI:
    def test_compare_returns_all_countries(self):
        r = client.post("/roi/compare", json={"major":"cs","countries":["us","uk","de","au","in"],"tier":"mid","duration_years":4,"aid_pct":20,"living":"off"})
        assert r.status_code == 200
        assert len(r.json()) == 5

    def test_scores_in_range(self):
        r = client.post("/roi/compare", json={"major":"engineering","countries":["us","de"],"tier":"mid","duration_years":4,"aid_pct":0,"living":"off"})
        for item in r.json():
            assert 0 <= item["scores"]["roi"] <= 100

    def test_invalid_major_rejected(self):
        r = client.post("/roi/compare", json={"major":"basket_weaving","countries":["us"]})
        assert r.status_code == 422

class TestPR:
    def test_australia_easier_than_us_for_india(self):
        r = client.post("/pr/pathways", json={"major":"cs","countries":["us","au"],"origin":"in"})
        data = r.json()
        us = next(d for d in data if d["country"]=="us")
        au = next(d for d in data if d["country"]=="au")
        assert au["ease_score"] > us["ease_score"]

    def test_us_has_lottery(self):
        r = client.post("/pr/pathways", json={"major":"cs","countries":["us"],"origin":"in"})
        assert r.json()[0]["has_lottery"] is True

    def test_germany_no_lottery(self):
        r = client.post("/pr/pathways", json={"major":"engineering","countries":["de"],"origin":"in"})
        assert r.json()[0]["has_lottery"] is False

import os
from pathlib import Path
from typing import Dict

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="easygoAI", version="1.0.0")

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = Path(os.getenv("MODEL_DIR", str(BASE_DIR / "models_artifacts")))
MODEL_FILES = {
    "rider_churn": "rider_churn.joblib",
    "rider_ltv": "rider_ltv.joblib",
    "driver_eta": "driver_eta.joblib",
    "driver_acceptance": "driver_acceptance.joblib",
}

models = {}


class PredictRequest(BaseModel):
    features: Dict[str, float]


def _load_models() -> None:
    missing = []
    for name, filename in MODEL_FILES.items():
        path = MODEL_DIR / filename
        if not path.exists():
            missing.append(str(path))
            continue
        models[name] = joblib.load(path)
    if missing:
        raise RuntimeError(f"Missing model files: {missing}")


@app.on_event("startup")
def startup() -> None:
    _load_models()


@app.get("/")
def root():
    return {"message": "easygoAI running"}


@app.get("/health")
def health():
    return {"status": "ok", "loaded_models": list(models.keys())}


def _predict(model_name: str, payload: PredictRequest):
    if model_name not in models:
        raise HTTPException(status_code=500, detail=f"Model not loaded: {model_name}")

    model = models[model_name]
    X = pd.DataFrame([payload.features])
    pred = model.predict(X)

    result = float(pred[0])
    response = {"prediction": result}

    if hasattr(model, "predict_proba"):
        try:
            proba = model.predict_proba(X)[0]
            response["probabilities"] = [float(x) for x in proba]
        except Exception:
            pass

    return response


@app.post("/predict/rider_churn")
def predict_rider_churn(payload: PredictRequest):
    return _predict("rider_churn", payload)


@app.post("/predict/rider_ltv")
def predict_rider_ltv(payload: PredictRequest):
    return _predict("rider_ltv", payload)


@app.post("/predict/driver_eta")
def predict_driver_eta(payload: PredictRequest):
    return _predict("driver_eta", payload)


@app.post("/predict/driver_acceptance")
def predict_driver_acceptance(payload: PredictRequest):
    return _predict("driver_acceptance", payload)

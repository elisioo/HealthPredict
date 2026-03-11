"""
Diabetes prediction script.
Reads a JSON object from stdin, runs it through the trained pipeline,
and writes a JSON result to stdout.

Usage (called by Node.js child_process):
  echo '{"gender":"Female","age":45,...}' | python predict.py

Required input fields:
  gender              : "Male" | "Female" | "Other"
  age                 : number
  hypertension        : 0 | 1
  heart_disease       : 0 | 1
  smoking_history     : "never" | "former" | "current" | "No Info"
  bmi                 : number
  HbA1c_level         : number
  blood_glucose_level : number
"""

import sys
import json
import os
import pickle

import numpy as np
import pandas as pd
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def load_pkl(filename):
    filepath = os.path.join(SCRIPT_DIR, filename)
    # Try joblib first (most sklearn pipelines use joblib.dump),
    # fall back to stdlib pickle
    try:
        return joblib.load(filepath)
    except Exception:
        with open(filepath, "rb") as f:
            return pickle.load(f)


def get_age_group(age):
    if age < 30:
        return "<30"
    if age < 45:
        return "30-45"
    if age < 60:
        return "45-60"
    return "60-80"   # also covers 80+


def get_bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25.0:
        return "Normal"
    if bmi < 30.0:
        return "Overweight"
    return "Obese"


# Map form-facing smoking values → model categories
SMOKING_MAP = {
    "never":       "never",
    "former":      "former",
    "current":     "current",
    "not current": "former",
    "ever":        "former",
    "no info":     "unknown",
    "No Info":     "unknown",
    "unknown":     "unknown",
}


def risk_level(prob):
    if prob >= 0.60:
        return "high"
    if prob >= 0.30:
        return "moderate"
    return "low"


def main():
    raw = sys.stdin.read().strip()
    if not raw:
        raise ValueError("No input received on stdin")

    data = json.loads(raw)

    model         = load_pkl("diabetes_best_model.pkl")
    preprocessor  = load_pkl("diabetes_preprocessor.pkl")
    threshold_obj = load_pkl("diabetes_threshold.pkl")

    threshold = float(threshold_obj)

    age                 = float(data["age"])
    bmi                 = float(data["bmi"])
    HbA1c               = float(data["HbA1c_level"])
    glucose             = float(data["blood_glucose_level"])
    hypertension        = int(data["hypertension"])
    heart_disease       = int(data["heart_disease"])
    smoking_raw         = str(data["smoking_history"])
    gender              = str(data["gender"])

    smoking = SMOKING_MAP.get(smoking_raw, SMOKING_MAP.get(smoking_raw.lower(), "unknown"))

    # Engineered features (must exactly match training-time logic)
    glucose_HbA1c_ratio = glucose / HbA1c if HbA1c != 0 else 0.0
    risk_score          = hypertension + heart_disease
    age_group           = get_age_group(age)
    bmi_category        = get_bmi_category(bmi)

    df = pd.DataFrame([{
        "age":                 age,
        "bmi":                 bmi,
        "HbA1c_level":         HbA1c,
        "blood_glucose_level": glucose,
        "hypertension":        hypertension,
        "heart_disease":       heart_disease,
        "glucose_HbA1c_ratio": glucose_HbA1c_ratio,
        "risk_score":          risk_score,
        "gender":              gender,
        "smoking_history":     smoking,
        "age_group":           age_group,
        "bmi_category":        bmi_category,
    }])

    X    = preprocessor.transform(df)
    prob = float(model.predict_proba(X)[0][1])

    result = {
        "diabetes_result": 1 if prob >= threshold else 0,
        "probability":     round(prob * 100, 2),   # percentage 0–100
        "risk_level":      risk_level(prob),
    }

    sys.stdout.write(json.dumps(result) + "\n")
    sys.stdout.flush()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        err = {"error": str(exc)}
        sys.stderr.write(json.dumps(err) + "\n")
        sys.stderr.flush()
        sys.exit(1)

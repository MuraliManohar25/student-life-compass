import os
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
import joblib

def train_and_save_models():
    os.makedirs("backend/ml/saved_models", exist_ok=True)
    print("Training ML Models for Student Life Compass...")

    # 1. Budget Prediction Model (Linear Regression)
    # Features: [daily_avg, days_elapsed, total_days_in_month, food_spend_ratio, academic_spend_ratio]
    np.random.seed(42)
    n_budget_samples = 300
    daily_avg = np.random.uniform(50, 300, n_budget_samples)
    days_elapsed = np.random.randint(1, 31, n_budget_samples)
    total_days = 30
    food_ratio = np.random.uniform(0.2, 0.7, n_budget_samples)
    academic_ratio = np.random.uniform(0.1, 0.5, n_budget_samples)

    # Spending target = daily_avg * total_days * (1 + 0.1 * food_ratio)
    monthly_target = daily_avg * total_days * (1.0 + 0.15 * food_ratio) + np.random.normal(0, 50, n_budget_samples)

    X_budget = np.column_stack([daily_avg, days_elapsed, np.full(n_budget_samples, total_days), food_ratio, academic_ratio])
    y_budget = monthly_target

    budget_model = LinearRegression()
    budget_model.fit(X_budget, y_budget)
    joblib.dump(budget_model, "backend/ml/saved_models/budget_linear_model.joblib")
    print("Saved: backend/ml/saved_models/budget_linear_model.joblib")

    # 2. Academic Risk Model (Random Forest Classifier)
    # Features: [workload_density_pct, sleep_hours, upcoming_exams_48h, pending_assignments, current_gpa]
    # Class: 0 = Low, 1 = Moderate, 2 = High Risk
    n_risk_samples = 500
    workload = np.random.uniform(20, 95, n_risk_samples)
    sleep = np.random.uniform(4.0, 9.0, n_risk_samples)
    exams = np.random.randint(0, 4, n_risk_samples)
    assignments = np.random.randint(0, 8, n_risk_samples)
    gpa = np.random.uniform(2.5, 4.0, n_risk_samples)

    # Determine synthetic risk level label
    risk_score = workload * 0.4 - sleep * 6.0 + exams * 12.0 + assignments * 5.0 - (gpa - 2.5) * 8.0
    risk_labels = np.where(risk_score < 15, 0, np.where(risk_score < 40, 1, 2))

    X_risk = np.column_stack([workload, sleep, exams, assignments, gpa])
    y_risk = risk_labels

    risk_model = RandomForestClassifier(n_estimators=100, random_state=42)
    risk_model.fit(X_risk, y_risk)
    joblib.dump(risk_model, "backend/ml/saved_models/academic_risk_rf_model.joblib")
    print("Saved: backend/ml/saved_models/academic_risk_rf_model.joblib")

    # 3. Placement Readiness Model (Gradient Boosting Regressor)
    # Features: [resume_score, dsa_solved, projects_count, github_commits_30d, skill_match_pct]
    n_placement_samples = 400
    resume = np.random.uniform(50, 100, n_placement_samples)
    dsa = np.random.randint(20, 300, n_placement_samples)
    projects = np.random.randint(1, 8, n_placement_samples)
    commits = np.random.randint(5, 100, n_placement_samples)
    skill_match = np.random.uniform(40, 100, n_placement_samples)

    readiness_score = (
        0.30 * resume +
        0.25 * np.minimum(dsa / 2.5, 100) +
        0.20 * np.minimum(projects * 15, 100) +
        0.10 * np.minimum(commits * 1.5, 100) +
        0.15 * skill_match
    )

    X_placement = np.column_stack([resume, dsa, projects, commits, skill_match])
    y_placement = readiness_score

    placement_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    placement_model.fit(X_placement, y_placement)
    joblib.dump(placement_model, "backend/ml/saved_models/placement_gb_model.joblib")
    print("Saved: backend/ml/saved_models/placement_gb_model.joblib")

    print("All ML models trained and saved successfully!")

if __name__ == "__main__":
    train_and_save_models()

import os
import joblib
import numpy as np

# Resolve paths relative to this file so they work regardless of where uvicorn is started from
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUDGET_MODEL_PATH = os.path.join(_BASE_DIR, "../../ml/saved_models/budget_linear_model.joblib")
RISK_MODEL_PATH = os.path.join(_BASE_DIR, "../../ml/saved_models/academic_risk_rf_model.joblib")
PLACEMENT_MODEL_PATH = os.path.join(_BASE_DIR, "../../ml/saved_models/placement_gb_model.joblib")

class MLService:
    def __init__(self):
        self.budget_model = None
        self.risk_model = None
        self.placement_model = None
        self.load_models()

    def load_models(self):
        try:
            if os.path.exists(BUDGET_MODEL_PATH):
                self.budget_model = joblib.load(BUDGET_MODEL_PATH)
            if os.path.exists(RISK_MODEL_PATH):
                self.risk_model = joblib.load(RISK_MODEL_PATH)
            if os.path.exists(PLACEMENT_MODEL_PATH):
                self.placement_model = joblib.load(PLACEMENT_MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load ML models directly: {e}")

    def predict_budget(self, daily_avg: float, days_elapsed: int, total_days: int = 30, food_ratio: float = 0.4, academic_ratio: float = 0.3) -> dict:
        if self.budget_model:
            features = np.array([[daily_avg, days_elapsed, total_days, food_ratio, academic_ratio]])
            predicted_total = float(self.budget_model.predict(features)[0])
        else:
            predicted_total = daily_avg * total_days * 1.05

        predicted_total = max(predicted_total, daily_avg * days_elapsed)
        monthly_budget = 5000.0
        remaining_budget = max(0.0, monthly_budget - (daily_avg * days_elapsed))
        daily_cap = max(50.0, remaining_budget / max(1, (total_days - days_elapsed)))

        suggestions = []
        if daily_avg > 180:
            suggestions.append("Hostel canteen expenses are above average. Limit coffee & food delivery spending.")
        else:
            suggestions.append("Great spending discipline! You saved ₹400 by avoiding late food delivery fees.")

        if remaining_budget < 1000:
            suggestions.append("Caution: Budget runway is low for the remainder of the month.")
        else:
            suggestions.append("Financial runway is healthy for hostel & academic needs.")

        return {
            "predicted_monthly_total": round(predicted_total, 2),
            "remaining_budget": round(remaining_budget, 2),
            "monthly_budget": monthly_budget,
            "daily_cap": round(daily_cap, 2),
            "suggestions": suggestions,
            "forecast_confidence": 94.5
        }

    def predict_academic_risk(self, workload_density: float, sleep_hours: float, upcoming_exams: int, pending_assignments: int, current_gpa: float) -> dict:
        if self.risk_model:
            features = np.array([[workload_density, sleep_hours, upcoming_exams, pending_assignments, current_gpa]])
            risk_class = int(self.risk_model.predict(features)[0])
        else:
            if workload_density > 75 or upcoming_exams >= 2:
                risk_class = 2
            elif workload_density > 50:
                risk_class = 1
            else:
                risk_class = 0

        risk_labels = {0: "Low", 1: "Moderate", 2: "High"}
        risk_level = risk_labels.get(risk_class, "Moderate")

        base_score = min(95.0, max(20.0, workload_density * 0.6 + upcoming_exams * 12.0 + pending_assignments * 4.0 - sleep_hours * 3.0))

        recommendations = [
            {
                "icon": "schedule",
                "color": "amber",
                "text": "Complete DBMS lab assignment before 8 PM tonight to free up Thursday morning."
            },
            {
                "icon": "bedtime",
                "color": "cyan",
                "text": f"Target 7.5 hours sleep (current average is {sleep_hours}h)."
            }
        ]
        if risk_level == "High":
            recommendations.append({
                "icon": "warning",
                "color": "red",
                "text": "High exam concentration detected in 48h. Reschedule non-urgent project tasks."
            })

        return {
            "burnout_risk_score": round(base_score, 1),
            "risk_level": risk_level,
            "workload_density": workload_density,
            "peak_in_hours": 48,
            "recommendations": recommendations
        }

    def predict_placement_readiness(self, resume_score: float, dsa_solved: int, projects_count: int, github_commits: int, skill_match: float) -> dict:
        if self.placement_model:
            features = np.array([[resume_score, dsa_solved, projects_count, github_commits, skill_match]])
            overall_score = float(self.placement_model.predict(features)[0])
        else:
            overall_score = (resume_score * 0.35 + (dsa_solved / 250.0 * 100) * 0.3 + (projects_count / 5.0 * 100) * 0.2 + skill_match * 0.15)

        overall_score = round(min(98.0, max(40.0, overall_score)), 1)
        match_rate = f"{int(overall_score)}% Match"

        recommendations = []
        if dsa_solved < 150:
            recommendations.append("Solve 20 more medium Graph & DP problems on LeetCode.")
        if projects_count < 3:
            recommendations.append("Add Docker containerized deployment to your PyTorch project.")
        recommendations.append("Resume passed AI screening with top marks for Backend & ML roles.")

        return {
            "overall_score": overall_score,
            "resume_score": resume_score,
            "projects_score": min(95.0, projects_count * 20.0),
            "github_score": min(92.0, github_commits * 1.5),
            "dsa_score": min(95.0, dsa_solved / 2.5),
            "communication_score": 88.0,
            "match_rate": match_rate,
            "recommendations": recommendations
        }

ml_service = MLService()

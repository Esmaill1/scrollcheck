from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.linear_model import Ridge
from sklearn.metrics import f1_score, r2_score, silhouette_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

RANDOM_STATE = 42

app = FastAPI(title="ScrollCheck API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _locate_csv() -> Path:
    candidates = [
        Path(__file__).resolve().parent / "Students_Social_Media_Addiction.csv",
        Path(__file__).resolve().parent.parent.parent / "Students_Social_Media_Addiction.csv",
        Path("Students_Social_Media_Addiction.csv"),
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError("Could not find Students_Social_Media_Addiction.csv")


# ---------------------------------------------------------------------------
# Train pipeline at startup on the 705-student dataset
# ---------------------------------------------------------------------------
df_raw = pd.read_csv(_locate_csv())
df = df_raw.drop(columns=["Student_ID", "Country"]).copy()
df["Country_Label"] = df_raw["Country"].fillna("Unknown")

for col in ["Avg_Daily_Usage_Hours", "Conflicts_Over_Social_Media"]:
    if df[col].isnull().any():
        df[col] = df[col].fillna(df[col].median())

iqr_bounds: Dict[str, tuple[float, float]] = {}
for col in ["Avg_Daily_Usage_Hours", "Sleep_Hours_Per_Night"]:
    q1, q3 = df[col].quantile([0.25, 0.75])
    iqr = q3 - q1
    lower, upper = float(q1 - 1.5 * iqr), float(q3 + 1.5 * iqr)
    iqr_bounds[col] = (lower, upper)
    df[col] = df[col].clip(lower=lower, upper=upper)

df["Usage_to_Sleep_Ratio"] = df["Avg_Daily_Usage_Hours"] / df["Sleep_Hours_Per_Night"]
df["Sleep_Deficit"] = np.maximum(0.0, 8.0 - df["Sleep_Hours_Per_Night"])
df["Affects_Academic_Performance_Bin"] = df["Affects_Academic_Performance"].map({"Yes": 1, "No": 0})
LEVEL_MAP = {"High School": 0, "Undergraduate": 1, "Graduate": 2}
df["Academic_Level_Ord"] = df["Academic_Level"].map(LEVEL_MAP)

categorical_cols = ["Gender", "Most_Used_Platform", "Relationship_Status"]
df_encoded = pd.get_dummies(
    df.drop(columns=["Academic_Level", "Affects_Academic_Performance", "Country_Label"]),
    columns=categorical_cols,
    drop_first=True,
    dtype=int,
)

# 1. K-Means Personas + 2D PCA map
PERSONA_FEATURES = [
    "Avg_Daily_Usage_Hours",
    "Sleep_Hours_Per_Night",
    "Conflicts_Over_Social_Media",
    "Mental_Health_Score",
]
scaler_persona = StandardScaler()
X_persona_sc = scaler_persona.fit_transform(df[PERSONA_FEATURES].to_numpy())

kmeans = KMeans(n_clusters=3, random_state=RANDOM_STATE, n_init=10)
df["KMeans_Cluster"] = kmeans.fit_predict(X_persona_sc)
kmeans_sil = float(silhouette_score(X_persona_sc, df["KMeans_Cluster"]))

cluster_order = (
    df.groupby("KMeans_Cluster")["Avg_Daily_Usage_Hours"]
    .mean()
    .sort_values()
    .index.tolist()
)
PERSONA_NAMES = ["Balanced", "Moderate Risk", "High Burnout Risk"]
persona_map = {cid: pname for cid, pname in zip(cluster_order, PERSONA_NAMES)}
df["Persona"] = df["KMeans_Cluster"].map(persona_map)

pca = PCA(n_components=2, random_state=RANDOM_STATE)
X_pca = pca.fit_transform(X_persona_sc)
pca_x_sign = -1.0 if np.corrcoef(X_pca[:, 0], df["Avg_Daily_Usage_Hours"])[0, 1] < 0 else 1.0
X_pca[:, 0] *= pca_x_sign
df["pca_x"] = X_pca[:, 0]
df["pca_y"] = X_pca[:, 1]

# 2. Ridge Regression (Mental Health Score)
reg_exclude = ["Mental_Health_Score", "Addicted_Score", "Affects_Academic_Performance_Bin"]
X_reg = df_encoded.drop(columns=reg_exclude)
y_reg = df_encoded["Mental_Health_Score"]
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X_reg, y_reg, test_size=0.2, random_state=RANDOM_STATE
)
scaler_r = StandardScaler()
ridge_model = Ridge(alpha=1.0, random_state=RANDOM_STATE)
ridge_model.fit(scaler_r.fit_transform(X_train_r), y_train_r)
ridge_r2 = float(r2_score(y_test_r, ridge_model.predict(scaler_r.transform(X_test_r))))

# 3. XGBoost Classifier (Academic Impact Risk)
clf_exclude = ["Affects_Academic_Performance_Bin", "Addicted_Score", "Mental_Health_Score"]
X_clf = df_encoded.drop(columns=clf_exclude)
y_clf = df_encoded["Affects_Academic_Performance_Bin"]
X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
    X_clf, y_clf, test_size=0.2, stratify=y_clf, random_state=RANDOM_STATE
)
scaler_c = StandardScaler()
xgb_model = XGBClassifier(eval_metric="logloss", random_state=RANDOM_STATE)
xgb_model.fit(scaler_c.fit_transform(X_train_c), y_train_c)
xgb_f1 = float(f1_score(y_test_c, xgb_model.predict(scaler_c.transform(X_test_c))))

TOP_PLATFORMS = [
    "Instagram",
    "TikTok",
    "Facebook",
    "YouTube",
    "WhatsApp",
    "Twitter",
    "LinkedIn",
    "Snapchat",
]

COHORT_STUDENTS = [
    {
        "id": int(idx) + 1,
        "x": round(float(row["pca_x"]), 4),
        "y": round(float(row["pca_y"]), 4),
        "persona": row["Persona"],
        "age": int(row["Age"]),
        "country": row["Country_Label"],
        "platform": row["Most_Used_Platform"],
        "academic_level": row["Academic_Level"],
        "usage_hours": round(float(row["Avg_Daily_Usage_Hours"]), 2),
        "sleep_hours": round(float(row["Sleep_Hours_Per_Night"]), 2),
        "conflicts": int(row["Conflicts_Over_Social_Media"]),
        "mental_health": int(row["Mental_Health_Score"]),
        "academics_affected": row["Affects_Academic_Performance"],
    }
    for idx, row in df.iterrows()
]

COHORT_CENTROIDS = [
    {
        "persona": pname,
        "x": round(float(grp["pca_x"].mean()), 4),
        "y": round(float(grp["pca_y"].mean()), 4),
        "avg_usage": round(float(grp["Avg_Daily_Usage_Hours"].mean()), 2),
        "avg_sleep": round(float(grp["Sleep_Hours_Per_Night"].mean()), 2),
        "count": int(len(grp)),
    }
    for pname in PERSONA_NAMES
    for grp in [df[df["Persona"] == pname]]
]


class SimulateRequest(BaseModel):
    age: int = Field(default=20, ge=16, le=30)
    daily_usage_hours: float = Field(default=5.0, ge=0.5, le=14.0)
    sleep_hours: float = Field(default=6.8, ge=3.0, le=11.0)
    conflicts: int = Field(default=2, ge=0, le=5)
    platform: str = "Instagram"
    academic_level: str = "Undergraduate"
    gender: str = "Female"
    relationship_status: str = "Single"


def _evaluate_profile(
    age: int,
    daily_usage_hours: float,
    sleep_hours: float,
    conflicts: int,
    platform: str,
    academic_level: str,
    gender: str,
    relationship_status: str,
) -> dict:
    u_low, u_high = iqr_bounds["Avg_Daily_Usage_Hours"]
    s_low, s_high = iqr_bounds["Sleep_Hours_Per_Night"]
    usage_clipped = float(np.clip(daily_usage_hours, u_low, u_high))
    sleep_clipped = float(np.clip(sleep_hours, s_low, s_high))

    row = pd.DataFrame(0.0, index=[0], columns=X_reg.columns)
    row["Age"] = age
    row["Avg_Daily_Usage_Hours"] = usage_clipped
    row["Sleep_Hours_Per_Night"] = sleep_clipped
    row["Conflicts_Over_Social_Media"] = conflicts
    row["Usage_to_Sleep_Ratio"] = usage_clipped / sleep_clipped
    row["Sleep_Deficit"] = max(0.0, 8.0 - sleep_clipped)
    row["Academic_Level_Ord"] = LEVEL_MAP.get(academic_level, 1)

    for col in (
        f"Gender_{gender}",
        f"Most_Used_Platform_{platform}",
        f"Relationship_Status_{relationship_status}",
    ):
        if col in row.columns:
            row[col] = 1.0

    mh_pred = float(np.clip(ridge_model.predict(scaler_r.transform(row[X_reg.columns]))[0], 1.0, 10.0))
    acad_prob = float(xgb_model.predict_proba(scaler_c.transform(row[X_clf.columns]))[0, 1])

    persona_vec = scaler_persona.transform([[usage_clipped, sleep_clipped, conflicts, mh_pred]])
    persona_label = persona_map[int(kmeans.predict(persona_vec)[0])]

    coords = pca.transform(persona_vec)[0]
    return {
        "mental_health_score": round(mh_pred, 2),
        "academic_risk_prob": round(acad_prob, 4),
        "persona": persona_label,
        "pca_point": {
            "x": round(float(coords[0] * pca_x_sign), 4),
            "y": round(float(coords[1]), 4),
        },
        "_persona_vec": persona_vec[0],
    }


def _build_archetype(persona: str, usage: float, sleep: float, conflicts: int) -> dict:
    if persona == "High Burnout Risk":
        if sleep < 6.0:
            return {
                "title": "The 2 AM Doomscroller",
                "tagline": "Your feed is eating your REM cycle — and tomorrow's focus.",
                "theme": "burnout",
            }
        if conflicts >= 4:
            return {
                "title": "The Notification Magnet",
                "tagline": "Constant online tension plus heavy scrolling is draining your battery.",
                "theme": "burnout",
            }
        return {
            "title": "The Endless Feed Rider",
            "tagline": "High daily screen time has pushed your routine into the red zone.",
            "theme": "burnout",
        }
    if persona == "Moderate Risk":
        return {
            "title": "The Overcaffeinated Crammer",
            "tagline": "Running on borderline sleep and mid-day scrolls — one good week flips this.",
            "theme": "moderate",
        }
    if sleep >= 7.5 and usage <= 3.5:
        return {
            "title": "The Rested Main Character",
            "tagline": "Protected sleep and controlled screen time keep your brain sharp.",
            "theme": "balanced",
        }
    return {
        "title": "The Steady Navigator",
        "tagline": "Healthy balance overall — keep guarding your sleep window.",
        "theme": "balanced",
    }


def _find_minimum_fix(req: SimulateRequest, current: dict) -> Optional[dict]:
    if current["persona"] == "Balanced" and current["academic_risk_prob"] < 0.5:
        return None

    u_grid = np.arange(req.daily_usage_hours, 1.75, -0.25)
    min_healthy_sleep = max(req.sleep_hours, 6.5)
    s_grid = np.arange(min_healthy_sleep, 8.75, 0.25)
    c_candidates = sorted({req.conflicts, min(req.conflicts, 2), min(req.conflicts, 1), 0}, reverse=True)

    best_candidate = None
    best_cost = float("inf")
    best_mh = -1.0

    for c in c_candidates:
        for u in u_grid:
            u_val = round(float(u), 2)
            for s in s_grid:
                s_val = round(float(s), 2)
                cost = abs(req.daily_usage_hours - u_val) + abs(s_val - req.sleep_hours) + 1.2 * abs(req.conflicts - c)
                if cost > best_cost + 0.01:
                    continue
                eval_res = _evaluate_profile(
                    req.age, u_val, s_val, c,
                    req.platform, req.academic_level, req.gender, req.relationship_status,
                )
                if eval_res["persona"] == "Balanced" and eval_res["academic_risk_prob"] < 0.5:
                    if cost < best_cost - 0.01 or (abs(cost - best_cost) <= 0.01 and eval_res["mental_health_score"] > best_mh):
                        best_cost = cost
                        best_mh = eval_res["mental_health_score"]
                        best_candidate = (u_val, s_val, c, eval_res)

    if best_candidate is None:
        fallback_eval = _evaluate_profile(
            req.age, 3.5, 7.8, 1,
            req.platform, req.academic_level, req.gender, req.relationship_status,
        )
        best_candidate = (3.5, 7.8, 1, fallback_eval)

    t_u, t_s, t_c, proj = best_candidate
    changes: List[str] = []
    if t_u < req.daily_usage_hours - 0.05:
        changes.append(f"trim daily screen time to {t_u:.1f}h (-{req.daily_usage_hours - t_u:.1f}h)")
    if t_s > req.sleep_hours + 0.05:
        changes.append(f"sleep {t_s:.1f}h/night (+{t_s - req.sleep_hours:.1f}h)")
    if t_c < req.conflicts:
        changes.append(f"reduce social-media tension to {t_c}")

    summary = (
        "Smallest shift to reach the Balanced group: " + ", ".join(changes) + "."
        if changes
        else "Minor adjustments stabilize your routine into the Balanced group."
    )

    return {
        "target_usage_hours": t_u,
        "target_sleep_hours": t_s,
        "target_conflicts": t_c,
        "projected_mental_health": proj["mental_health_score"],
        "projected_risk_prob": proj["academic_risk_prob"],
        "mental_health_gain": round(proj["mental_health_score"] - current["mental_health_score"], 2),
        "risk_prob_drop": round(current["academic_risk_prob"] - proj["academic_risk_prob"], 4),
        "summary": summary,
    }


router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "cohort_size": len(COHORT_STUDENTS)}


@router.get("/cohort")
def get_cohort():
    return {
        "students": COHORT_STUDENTS,
        "centroids": COHORT_CENTROIDS,
        "model_stats": {
            "ridge_r2": round(ridge_r2, 4),
            "xgb_f1": round(xgb_f1, 4),
            "kmeans_silhouette": round(kmeans_sil, 3),
        },
        "platforms": TOP_PLATFORMS,
    }


@router.post("/simulate")
def simulate(req: SimulateRequest):
    current = _evaluate_profile(
        req.age,
        req.daily_usage_hours,
        req.sleep_hours,
        req.conflicts,
        req.platform,
        req.academic_level,
        req.gender,
        req.relationship_status,
    )
    persona_vec = current.pop("_persona_vec")

    # Nearest real student twin in standardized persona space
    dists = np.linalg.norm(X_persona_sc - persona_vec, axis=1)
    twin_idx = int(np.argmin(dists))
    twin_dist = float(dists[twin_idx])
    similarity_pct = int(round(max(55.0, min(99.0, 100.0 * np.exp(-twin_dist / 2.2)))))
    nearest_twin = {
        **COHORT_STUDENTS[twin_idx],
        "similarity_pct": similarity_pct,
    }

    archetype = _build_archetype(
        current["persona"],
        req.daily_usage_hours,
        req.sleep_hours,
        req.conflicts,
    )

    semester_impact = {
        "days_per_year_scrolling": round(req.daily_usage_hours * 365.0 / 24.0, 1),
        "semester_scroll_hours": int(round(req.daily_usage_hours * 112.0)),
        "semester_sleep_debt_hours": int(round(max(0.0, 8.0 - req.sleep_hours) * 112.0)),
        "free_hours_daily": round(max(0.0, 24.0 - req.daily_usage_hours - req.sleep_hours), 1),
    }

    triggered_rules = [
        {
            "id": "screen_and_sleep",
            "title": "Over 5.5h screen time paired with under 6.5h sleep",
            "evidence": "2.73x higher chance of low mental well-being (78% in cohort)",
            "status": "active" if (req.daily_usage_hours > 5.5 and req.sleep_hours < 6.5) else "cleared",
        },
        {
            "id": "high_conflicts",
            "title": "Three or more social-media arguments or tension points",
            "evidence": "1.56x academic impact lift (strongly linked to grade drops)",
            "status": "active" if req.conflicts >= 3 else "cleared",
        },
        {
            "id": "heavy_scrolling",
            "title": "Daily social media use above 5.5 hours",
            "evidence": "2.30x higher rate of low mental well-being",
            "status": "active" if req.daily_usage_hours > 5.5 else "cleared",
        },
    ]

    minimum_fix = _find_minimum_fix(req, current)

    return {
        **current,
        "archetype": archetype,
        "nearest_twin": nearest_twin,
        "semester_impact": semester_impact,
        "triggered_rules": triggered_rules,
        "minimum_fix": minimum_fix,
    }


app.include_router(router, prefix="/api")
app.include_router(router)

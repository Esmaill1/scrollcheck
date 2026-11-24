# ScrollCheck — Student Digital Well-Being & Burnout Risk Analyzer

**Live App (Vercel):** https://scrollcheck-kappa.vercel.app

Interactive **What-If Digital Detox & Burnout Simulator** plus end-to-end machine learning notebook built on survey data from **705 students**.

## What Is Included
- **`Student_ScreenTime_Burnout_ML.ipynb`** — Complete Colab-ready & local ML notebook covering data cleaning, IQR outlier handling, feature engineering, **K-Means** lifestyle personas, **Apriori** habit risk rules, **Ridge Regression** (`R² = 0.8013`), and **XGBoost** (`F1 = 0.9945`).
- **`scrollcheck/`** — Full-stack web application (**FastAPI** + **React/Vite**):
  - Drag sliders for daily social media time, nightly sleep, and social tension to watch your predicted mental well-being (`1–10`) and academic risk `%` update live.
  - Interactive **705-student PCA Cohort Map** showing where your routine sits relative to *Balanced*, *Moderate Risk*, and *High Burnout Risk* peers.
  - **Smallest Change That Works** optimizer computing the minimal habit adjustment to reach the *Balanced* group.

## Run Locally
```bash
# 1. Start FastAPI backend
cd scrollcheck/backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000

# 2. Start React/Vite frontend (in another terminal)
cd scrollcheck/frontend
npm install
npm run dev
```
Or on Windows, double-click `scrollcheck/start_scrollcheck.bat`.

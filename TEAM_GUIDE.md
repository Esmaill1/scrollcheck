# ScrollCheck — دليل التيم 

> لو داخلين المناقشة كمان 5 دقايق ومكسلين تقرأوا الإنجليزي، اقرأوا الجزء المصري ده الأول — فيه كل حاجة محتاجين تعرفوها عشان تعرفوا تدافعوا عن المشروع قدام الدكتور.

---

## الشرح بالبلدي (قبل المناقشة بـ 5 دقايق)

### 1. إيه المشروع ده من الآخر؟
عبارة عن **كاشف إرهاق بسبب الموبايل** مبني على بيانات **705 طالب حقيقي من 110 دولة** (`Students_Social_Media_Addiction.csv`).  
الفكرة بسيطة: بندّي للموديل شوية أرقام عن يوم الطالب (بيمسك الموبايل كام ساعة، بينام كام ساعة، بيتخانق أو بيتوتر بسبب السوشيال قد إيه، وبيستخدم أبلكيشن إيه)، والموديل يطلعله:
1. نفسيته كام من 10.
2. احتمال درجاته في الكلية تتأثر قد إيه.
3. هو تبع أنهي جروب من الطلبة (*رايق*، *متوسط*، ولا *هلكان*).
4. **أسهل تعديل يعمله في يومه** عشان يرجع لبر الأمان.

وبدل ما المشروع يبقى نوتبوك مملة وخلاص، بنينا عليه موقع شغال لايف اسمه **ScrollCheck** أي طالب يفتحه ويجرّب يحرك السلايدرز ويشوف نتيجته بتتغير قدامه لحظيًا.

---

### 2. عملنا إيه في الداتا قبل التدريب؟ (التنضيف والتجهيز)
النوتبوك (`Student_ScreenTime_Burnout_ML.ipynb`) والباك إند (`scrollcheck/backend/main.py`) بيعملوا نفس الخطوات دي بالترتيب:

1. **رمينا الأعمدة اللي ملهاش لازمة في التدريب:**
   - شيلنا `Student_ID` (ده رقم تسلسلي مش أكتر).
   - شيلنا `Country` من التدريب عشان 110 دولة على 705 صف كانوا هيطلعوا 109 عمود فاضيين يشتتوا الموديل. *(بس سبنا اسم البلد عشان نعرضه في الموقع جنب أقرب طالب شبهك).*
2. **ملينا الخانات الفاضية:**
   - كان فيه خانتين ناقصين في الجدول كله؛ مليناهم بالـ **Median** (الوسيط: `4.8` ساعات موبايل، و`3.0` توتر) عشان ميتأثرش بالأرقام الشاذة.
3. **ظبطنا الأرقام الخيالية (IQR Winsorization):**
   - لقينا 5 طلبة كاتبين إنهم بيمسكوا الموبايل لحد `13` ساعة في اليوم. بدل ما نحذف الطلبة ونخسر صفوف، قصّينا الأرقام دي عند الحد الأعلى الطبيعي (`8.35` ساعة).
4. **اخترعنا عمودين أذكى (Feature Engineering):**
   - `Usage_to_Sleep_Ratio` = ساعات الموبايل ÷ ساعات النوم (بيبين الموبايل واكل من نومك قد إيه).
   - `Sleep_Deficit` = `max(0, 8 - Sleep_Hours)` (ناقصلك كام ساعة عن الـ 8 ساعات نوم الطبيعي).
5. **أهم حركة عشان الدكتور ميمسكش علينا غلطة (منع الغش / Target Leakage):**
   - في الداتاسيت فيه عمود اسمه `Addicted_Score` (درجة الإدمان من 1 لـ 10). ده مرتبط جدًا بالنفسية وبدرجات الكلية لأن الطالب اللي ملى الاستبيان كتبه معاهم في نفس اللحظة.
   - لو سبناه، الموديل هيغش منه ويجيب أرقام وهمية. فإحنا **شلناه خالص** من الموديلات المتوقعة عشان الموديل يتوقع من عاداتك الحقيقية بس (موبايل + نوم + توتر + أبلكيشن).

---

### 3. إيه الـ 4 موديلات اللي في المشروع؟ (كل واحد شغلته إيه)

| الموديل | شغلته بالبلدي | جاب كام؟ |
|---|---|---|
| **Ridge Regression** | بيخمن رقم **النفسية** بتاعك من 10 | **R² = 80.1%** (تفسير ممتاز من العادات بس) |
| **XGBoost Classifier** | بيقول **آه ولا لأ** (وبنسبة كام%) الموبايل هيأثر على درجاتك | **F1 = 99.45%**, **AUC = 1.00** |
| **K-Means (k=3) + PCA** | بيقسم الـ 705 طالب 3 جروبات (*متوازن*، *ضغط متوسط*، *إرهاق عالي*)، والـ PCA بيفردهم على خريطة 2D | **Silhouette = 0.416** |
| **Apriori** | بيطلع قواعد "لو عملت X + Y يحصل Z" عشان ننصح الطالب بكلام واضح | قاعدة `{موبايل > 5.5 س + نوم < 6.5 س}` بترفع خطر الإرهاق **2.73 ضعف** |

---

### 4. الموقع نفسه (ScrollCheck) شغال إزاي من جوه؟
1. **الفرونت إند (React + Vite):**
   - شاشة أولى ترحيبية -> 5 أسئلة واحدة ورا التانية -> بورد النتيجة التفاعلية.
   - أول ما تخلص الأسئلة (أو تحرك أي سلايدر أو تدوس على خطوة ديتوكس)، الموقع بيبعت أرقامك في طلب `POST /api/simulate` للباك إند.
2. **الباك إند (`scrollcheck/backend/main.py` - FastAPI):**
   - **لحظة ما السيرفر بيقوم:** بيقرأ الـ CSV، ينضف الداتا، ويدرّب الـ Ridge وXGBoost وK-Means وPCA في أقل من ثانية واحدة.
   - **لما يوصله طلب `simulate` بيعمل 4 حاجات:**
     1. يدخل أرقامك على `Ridge` و`XGBoost` و`K-Means` ويطلع نفسيتك + خطر درجاتك + جروبك + مكانك `(x, y)` على الخريطة.
     2. يحسب المسافة بينك وبين الـ 705 طالب (Euclidean distance) ويطلعلك **توأمك في البيانات** (أقرب طالب حقيقي ليك ونسبة الشبه%).
     3. **لو أنت في منطقة خطر (`_find_minimum_fix`):** يجرب آلاف الاحتمالات الصغيرة (يقلل الموبايل ربع ساعة بربع ساعة، ويزود النوم ربع ساعة بربع ساعة لحد 6.5+ س) ويختار **أصغر مجهود** يدخلك في جروب `Balanced` ويخلي خطر الدرجات تحت `50%`.
     4. يرجّع كل ده للفرونت إند عشان يلوّن الشاشة، يحرك البطارية، ويرسم السهم بتاعك على الخريطة.

---

### 5. أشهر 4 أسئلة رخمة من الدكتور وردها جاهز

- **س: مش 705 طالب داتاسيت صغيرة؟**  
  **ج:** للـ Tabular ML الكلاسيكي (`Ridge`, `XGBoost`, `K-Means`, `Apriori`) على ~10 أعمدة أساسيين، 705 صف رقم ممتاز وأكبر من داتاسيت السكاشن (`Iris` 150، `Mall Customers` 200)، ومتجمع من **110 دولة**. وكاتبين في الـ Limitations إننا نقدر نكبرها لو جمعنا استبيان من طلبة جامعتنا.
- **س: ليه ماسيفتوش الموديل في ملف `.pkl` وحملتوه؟**  
  **ج:** عشان الداتا 705 صف فالتدريب بياخد أقل من نص ثانية وقت تشغيل السيرفر، وكده بنضمن مفيش أي مشاكل تعارض نسخ `scikit-learn` / `xgboost` بين الويندوز بتاعنا وسيرفرات Vercel (Linux)، وكمان النوتبوك والموقع شغالين من نفس الكود والداتا بالمللي.
- **س: إزاي `XGBoost` جاب 99.4% وهو من غير `Addicted_Score`؟**  
  **ج:** لأن في الاستبيان ده عمود التوتر والخناقات (`Conflicts >= 3`) مع نسبة الموبايل للنوم (`Usage_to_Sleep_Ratio`) بيفصلوا الطلبة اللي درجاتهم اتأثرت عن الباقيين بوضوح جدًا.
- **س: إيه فايدة `K-Means` و`Apriori` طالما عندكم `XGBoost`؟**  
  **ج:** `XGBoost` بيقولك "فيه خطر 99%" بس ده رقم صامت؛ إنما `K-Means` بيوريك أنت واقف فين وسط زمايلك على الخريطة، و`Apriori` بيشرحلك **ليه** الخطر ده حصل (*عشان 5.5 س موبايل + نوم أقل من 6.5 س*) وبناءً عليه الموقع بيحسبلك خطة التعديل.

---

## Technical Reference (English)

Welcome to the detailed reference for **ScrollCheck** (**Student Digital Well-Being & Burnout Risk Analyzer**).

---

## 1. Repository File Map

| File / Folder | Role |
|---|---|
| `Students_Social_Media_Addiction.csv` | Raw survey dataset (**705 students**, **13 columns**, **110 countries**) |
| `Student_ScreenTime_Burnout_ML.ipynb` | Standalone Colab/Jupyter ML notebook (EDA, training, clustering, Apriori, evaluation) |
| `scrollcheck/backend/main.py` | FastAPI ML engine (trains on startup, serves `/api/health`, `/api/cohort`, `/api/simulate`) |
| `scrollcheck/backend/requirements.txt` | Python dependencies (uses `xgboost-cpu` 5.5 MB wheel on Linux/Vercel, standard `xgboost` locally) |
| `scrollcheck/frontend/src/LandingScreen.jsx` | Stage 1 — Full-screen Egyptian Arabic welcome screen |
| `scrollcheck/frontend/src/QuestionFlow.jsx` | Stage 2 — 5-step one-by-one questionnaire |
| `scrollcheck/frontend/src/App.jsx` | Stage 3 — Mood-reactive Result Reveal & What-If Detox Board (sliders + power-ups) |
| `scrollcheck/frontend/src/CohortMap.jsx` | Interactive 2D PCA map of all 705 students + real-world Data Twin matcher |
| `scrollcheck/frontend/src/BrainBattery.jsx` & `DayRing.jsx` | Animated mental-energy battery & 24-hour time split donut |
| `vercel.json` | Vercel Services config routing `/api/*` to FastAPI and `/*` to Vite static build |

---

## 2. Data Cleaning & Feature Engineering Pipeline

Both `Student_ScreenTime_Burnout_ML.ipynb` and `scrollcheck/backend/main.py` execute the exact same preprocessing steps:

1. **Columns Dropped Before Training:**
   - `Student_ID` (unique row ID, zero predictive value)
   - `Country` (110 distinct countries across 705 rows would create sparse noisy dummy columns; kept only as display metadata `Country_Label` for tooltips and the Data Twin card)
2. **Missing Values & Duplicates:**
   - Duplicate check: `0` duplicate rows.
   - Median imputation on the 2 missing entries: `Avg_Daily_Usage_Hours` (`median = 4.8`) and `Conflicts_Over_Social_Media` (`median = 3.0`).
3. **Outlier Handling (IQR Winsorization):**
   - Computes $[Q_1 - 1.5 \cdot \text{IQR},\; Q_3 + 1.5 \cdot \text{IQR}]$ instead of deleting rows, preserving all 705 students:
     - `Avg_Daily_Usage_Hours`: bounds `[1.55, 8.35]` → caps **5 extreme records** (including `13.0 hrs/day`).
     - `Sleep_Hours_Per_Night`: bounds `[3.45, 10.25]` → `0` records capped.
4. **Domain Feature Engineering:**
   - `Usage_to_Sleep_Ratio = Avg_Daily_Usage_Hours / Sleep_Hours_Per_Night`
   - `Sleep_Deficit = max(0.0, 8.0 - Sleep_Hours_Per_Night)`
5. **Encoding:**
   - `Affects_Academic_Performance` → binary target (`Yes = 1`, `No = 0`)
   - `Academic_Level` → ordinal (`High School = 0`, `Undergraduate = 1`, `Graduate = 2`)
   - `Gender`, `Most_Used_Platform`, `Relationship_Status` → one-hot encoded (`pd.get_dummies(..., drop_first=True)`) → **25 total encoded columns**.

### Important Anti-Leakage Rule
When training the supervised models, we **intentionally exclude** `Addicted_Score` and the other target column:
- `Ridge` predicts `Mental_Health_Score` **without** `Addicted_Score` or `Affects_Academic_Performance_Bin`.
- `XGBoost` predicts `Affects_Academic_Performance_Bin` **without** `Addicted_Score` or `Mental_Health_Score`.

**Why?** Those survey columns are co-reported outcome scales rather than independent daily habits. Excluding them forces the models to predict purely from observable behavior (screen hours, sleep hours, conflicts, app, demographics) — and avoids inflated fake accuracy.

---

## 3. The 4 Machine Learning Models & Verified Results

| Component | Algorithm | Inputs -> Target | Verified Score |
|---|---|---|---|
| **Mental Health Predictor** | `Ridge(alpha=1.0)` + `StandardScaler` | 22 habit & demographic features -> `Mental_Health_Score` (1–10) | **R² = 0.8013**, RMSE = `0.4884`, MAE = `0.3126` |
| **Academic Impact Classifier** | `XGBClassifier(eval_metric="logloss")` + `StandardScaler` | 22 habit & demographic features -> `Affects_Academic_Performance` (Yes/No) | **Accuracy = 0.9929**, **F1 = 0.9945**, **ROC-AUC = 1.0000** |
| **Lifestyle Personas & Map** | `KMeans(n_clusters=3, n_init=10)` + `PCA(n_components=2)` | 4 core indicators: `Avg_Daily_Usage_Hours`, `Sleep_Hours_Per_Night`, `Conflicts_Over_Social_Media`, `Mental_Health_Score` | **Silhouette = 0.416** (Balanced `282`, Moderate Risk `237`, High Burnout Risk `186`) |
| **Habit Risk Rules** | `Apriori` (`min_support=0.10`, `max_len=3`) | Binary habit tags -> burnout risk outcomes | `{ScreenTime > 5.5h, Sleep < 6.5h} -> MentalHealth <= 5` (**Lift = 2.73×**, Conf = `78.2%`) |

### PCA Axis Orientation Trick
In `main.py`, after fitting `PCA(n_components=2)` on standardized persona features, we check `np.corrcoef(X_pca[:, 0], df["Avg_Daily_Usage_Hours"])[0, 1]`. If negative, we multiply `pca_x` by `-1.0` (`pca_x_sign`). That guarantees **left on the map always means rested/balanced** and **right always means heavy scrolling/burnout**.

---

## 4. How the App Core Works (`main.py` ↔ React UI)

```text
[Stage 1: LandingScreen] ──(Start 15s check)──> [Stage 2: QuestionFlow (5 steps)]
                                                            │
                                                  POST /api/simulate
                                                            ▼
[Stage 3: Result & What-If Board] <──(pins baseline)── [FastAPI ML Engine]
   ├─ Sliders & Detox Power-Ups ────── POST /api/simulate ──> Ridge + XGBoost + K-Means + Twin + Min-Fix
   └─ 705-Student Galaxy Map <──────── GET /api/cohort ────── 705 PCA points + 3 centroids
```

### What Happens Inside `POST /api/simulate` (`scrollcheck/backend/main.py`)
1. **`_evaluate_profile(...)`:**
   - Clips incoming `daily_usage_hours` and `sleep_hours` to the training IQR bounds.
   - Engineers `Usage_to_Sleep_Ratio` and `Sleep_Deficit`, one-hot encodes `platform` / `gender` / `relationship_status`, and scales with `scaler_r` & `scaler_c`.
   - Runs **Ridge** (`mental_health_score`, clipped to `[1, 10]`) and **XGBoost** (`academic_risk_prob`).
   - Builds the 4D vector `[usage_clipped, sleep_clipped, conflicts, mh_pred]`, scales with `scaler_persona`, assigns the **K-Means** persona, and projects `(x, y)` into 2D PCA space.
2. **Real-World Data Twin (`nearest_twin`):**
   - Computes Euclidean distance from the user's 4D `persona_vec` to all 705 students (`np.linalg.norm(X_persona_sc - persona_vec, axis=1)`).
   - Picks `argmin(dists)` and converts distance to a `55%–99%` match score (`100 * exp(-dist / 2.2)`).
3. **Minimum Detox Optimizer (`_find_minimum_fix`):**
   - If the user is not already `Balanced` with `< 50%` academic risk, searches a grid of lower daily usage (`down to 1.75h`), healthier sleep (`>= max(current_sleep, 6.5h)` up to `8.5h`), and lower conflicts (`0..current`).
   - Picks the **lowest-effort combination** (`min |Δusage| + |Δsleep| + 1.2·|Δconflicts|`) that pushes `_evaluate_profile(...)` back into `Balanced` with `< 50%` academic risk.
4. **Archetype, Semester Impact & Empirical Rules:**
   - Assigns an Egyptian Arabic persona archetype (`_build_archetype`), calculates yearly scrolling days (`usage * 365 / 24`) and 16-week semester totals (`* 112 days`), and flags the 3 empirical Apriori habit traps.

### Deployment Setup (`vercel.json`)
- Uses **Vercel Services** to build `scrollcheck/frontend` (Vite static output) and `scrollcheck/backend` (`main:app` FastAPI serverless function) in one deployment.
- `scrollcheck/backend/requirements.txt` uses `xgboost-cpu; sys_platform == 'linux'` (~5.5 MB wheel instead of the ~55 MB GPU/full wheel) so the Python serverless bundle builds quickly and stays well under Vercel size limits.

---

## 5. Suggested Presentation Split (3–4 Teammates)

1. **Member 1 — Problem, Dataset & Cleaning:** Why student screen burnout matters, 705-student / 110-country dataset overview, median imputation, IQR Winsorization (catching `13h/day`), and `Usage_to_Sleep_Ratio` / `Sleep_Deficit`.
2. **Member 2 — Supervised Models & Anti-Leakage:** Ridge Regression (`R² = 0.8013`), XGBoost (`F1 = 0.9945`), and why dropping `Addicted_Score` keeps predictions honest.
3. **Member 3 — Unsupervised Personas & Rules:** K-Means (`k=3`, `Silhouette = 0.416`) + 2D PCA map + Apriori habit traps (`2.73×` lift for `>5.5h` screen + `<6.5h` sleep).
4. **Member 4 — Live ScrollCheck Web App Demo:** Walk through the 3-stage Egyptian Arabic UI (Landing → 5-question check → Result + Data Twin + Detox Power-Ups + `Apply smallest fix` trajectory arrow).

---

## 6. Quick Q&A Cheat Sheet for Defense

- **Q: Isn't 705 students a small dataset?**  
  *A:* For classical tabular ML (`Ridge`, `XGBoost`, `K-Means`, `Apriori`) on ~10–25 features, 705 records is solidly larger than standard benchmarks (`Iris` 150, `Mall Customers` 200) and gives clean statistical separation (`±3.7%` margin) with sub-second training. We also note sample size and self-reported survey bias as study limitations.
- **Q: Why didn't you save `.pkl` files and load them instead of training on FastAPI startup?**  
  *A:* Training on 705 rows takes `< 0.5s` at cold start, guarantees zero `scikit-learn` / `xgboost` pickle version-mismatch errors between Windows and Linux/Vercel, and keeps the notebook and production backend 100% synchronized from the same CSV.
- **Q: Why did XGBoost get 99.3% F1?**  
  *A:* In this dataset, `Conflicts_Over_Social_Media >= 3` combined with high `Usage_to_Sleep_Ratio` strongly separates students who report academic disruption from those who don't — even after excluding `Addicted_Score` and `Mental_Health_Score`.
- **Q: How does "Smallest shift that works" decide what to recommend?**  
  *A:* It runs a real constrained grid search over `(usage, sleep, conflicts)` through the same trained Ridge + XGBoost + K-Means pipeline, requiring `sleep >= 6.5h` and `persona == Balanced` + `risk < 50%`, and returns the tweak with minimum total lifestyle change.

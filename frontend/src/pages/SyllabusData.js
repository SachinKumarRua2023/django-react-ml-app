// ============================================================
// SYLLABUS DATA FILE — seekhowithrua.com
// Stanford / Harvard University Level — 3 Master Tracks
// Trainers edit via UI (localStorage). Learners = read-only.
// ============================================================

export const defaultSyllabusData = {

  // ══════════════════════════════════════════════════════════
  // TRACK 1 — AI & DATA SCIENCE
  // ══════════════════════════════════════════════════════════
  ai_ds: {
    title: "AI & Data Science",
    icon: "🤖",
    color: "#a855f7",
    modules: {
      "Module 1 — Python for Data Science": [
        "Python Setup, Environments & Jupyter Notebooks",
        "Variables, Data Types & Type Casting",
        "Strings, String Methods & f-Strings",
        "Lists, Tuples, Sets & Dictionaries",
        "Control Flow: if / elif / else",
        "Loops: for, while, break, continue, pass",
        "Functions, *args, **kwargs & Lambda",
        "List Comprehensions & Generator Expressions",
        "Classes, Objects, Inheritance & Polymorphism",
        "Dunder Methods & Operator Overloading",
        "File I/O: CSV, JSON & TXT Handling",
        "Exception Handling & Custom Exceptions",
        "Modules, Packages & pip",
        "Iterators, Generators & Decorators",
        "Regular Expressions (re module)",
        "datetime, os, sys & pathlib Modules",
        "Big-O Notation & Complexity Analysis",
        "Sorting Algorithms: Merge, Quick, Heap Sort",
        "Searching: Binary Search & Hash Maps",
        "Recursion & Dynamic Programming Basics"
      ],
      "Module 2 — Data Science Libraries": [
        "NumPy Arrays: Creation, Indexing & Slicing",
        "Array Operations: Broadcasting & Vectorization",
        "Linear Algebra with NumPy (dot, inv, eig)",
        "Random Number Generation & Seeding",
        "Pandas Series & DataFrame: Creation & Attributes",
        "Indexing: loc, iloc, Boolean & Fancy Indexing",
        "Data Cleaning: dropna, fillna, duplicates",
        "Merging, Joining & Concatenating DataFrames",
        "GroupBy, Aggregation & Pivot Tables",
        "Apply, Map & Lambda on DataFrames",
        "Time Series with DatetimeIndex",
        "Matplotlib: Figures, Axes & Subplots",
        "Line, Bar, Scatter, Histogram & Pie Charts",
        "Seaborn: Statistical Plot Gallery",
        "Heatmaps, Pairplots & Distribution Plots",
        "Interactive Charts with Plotly Express",
        "Plotly Dash Basics for Dashboards",
        "Styling, Themes & Publication-Ready Figures"
      ],
      "Module 3 — Exploratory Data Analysis (EDA)": [
        "Types of Data: Nominal, Ordinal, Interval, Ratio",
        "Data Collection & Source Evaluation",
        "Loading & Inspecting Raw Datasets",
        "Summary Statistics: Mean, Median, Mode, Std",
        "Identifying & Handling Missing Values",
        "Outlier Detection: IQR, Z-Score, Isolation Forest",
        "Data Type Errors & Inconsistent Formatting",
        "Duplicate Detection & Record Linkage",
        "Distribution Analysis & Normality Tests",
        "Skewness, Kurtosis & Power Transformations",
        "Correlation: Pearson, Spearman & Kendall",
        "Scatter Plots, Box Plots & Violin Plots",
        "Cross-Tabulation & Chi-Square Test",
        "Feature Distributions & Class Imbalance",
        "Cardinality Analysis for Categorical Features",
        "Multicollinearity & VIF Analysis",
        "Automated EDA: pandas-profiling & sweetviz",
        "EDA Case Study: Titanic Dataset",
        "EDA Case Study: House Prices Dataset",
        "EDA Case Study: E-Commerce Dataset"
      ],
      "Module 4 — SQL for Data Science": [
        "Relational Model, Tables & Schema Design",
        "DDL: CREATE, ALTER, DROP, TRUNCATE",
        "DML: INSERT, UPDATE, DELETE",
        "SELECT, WHERE, ORDER BY & LIMIT",
        "JOINS: INNER, LEFT, RIGHT, FULL OUTER",
        "Subqueries, CTEs & Recursive Queries",
        "GROUP BY, HAVING & Aggregate Functions",
        "CASE Expressions & Conditional Logic",
        "String, Date & Math Functions",
        "Window Functions: ROW_NUMBER, RANK, DENSE_RANK",
        "LAG, LEAD, FIRST_VALUE, LAST_VALUE",
        "Running Totals & Moving Averages with OVER()",
        "PIVOT & UNPIVOT Transformations",
        "Query Optimization & EXPLAIN Plans",
        "SQL with Python: SQLAlchemy & psycopg2",
        "Pandas read_sql & DataFrame to SQL",
        "Data Pipelines: SQL + Python",
        "PostgreSQL for Data Science Projects",
        "Google BigQuery & Cloud SQL Basics"
      ],
      "Module 5 — Business Intelligence (PowerBI & Tableau)": [
        "What is BI? OLAP vs OLTP vs Data Warehouse",
        "Dimensional Modeling: Star & Snowflake Schema",
        "KPIs, Metrics & Dashboard Design Principles",
        "Power BI Desktop: Data Import & Power Query",
        "DAX Fundamentals: Measures & Calculated Columns",
        "DAX Advanced: CALCULATE, FILTER, ALL, SUMX",
        "Relationships, Data Model & Cardinality",
        "Visualizations: Charts, Cards, Maps & Slicers",
        "Power BI Service: Publish, Share & Workspaces",
        "Row-Level Security (RLS) & Data Governance",
        "Tableau Desktop: Connect, Prepare & Explore",
        "Calculated Fields, Parameters & Filters",
        "LOD Expressions: FIXED, INCLUDE, EXCLUDE",
        "Dashboard Design & Interactivity in Tableau",
        "Tableau Server & Tableau Public Publishing",
        "Project: Sales Performance Dashboard (Power BI)",
        "Project: Customer Segmentation Dashboard (Tableau)",
        "Project: Executive KPI Report End-to-End"
      ],
      "Module 6 — Statistics & Probability for Data Science": [
        "Sample Spaces, Events & Axioms of Probability",
        "Conditional Probability & Bayes Theorem",
        "Independence, Multiplication & Addition Rules",
        "Permutations, Combinations & Counting",
        "Discrete Distributions: Bernoulli, Binomial, Poisson",
        "Continuous Distributions: Uniform, Exponential",
        "Normal Distribution & the 68-95-99.7 Rule",
        "Central Limit Theorem: Proof & Intuition",
        "Sampling Distributions & Standard Error",
        "Measures of Central Tendency & Spread",
        "Confidence Intervals: Construction & Interpretation",
        "Hypothesis Testing: Z-test, t-test, F-test",
        "p-Values, Significance Levels & Type I/II Errors",
        "Chi-Square Tests & Goodness of Fit",
        "Covariance, Pearson & Spearman Correlation",
        "Simple Linear Regression: OLS Derivation",
        "Multiple Regression: Assumptions & Diagnostics",
        "ANOVA: One-Way & Two-Way Analysis",
        "Non-Parametric Tests: Mann-Whitney, Kruskal-Wallis"
      ],
      "Module 7 — Advanced Statistics for Data Science": [
        "Bayesian vs Frequentist Philosophy",
        "Prior, Likelihood & Posterior Distributions",
        "Bayesian Inference with PyMC",
        "Markov Chain Monte Carlo (MCMC) Sampling",
        "A/B Testing: Design, Power & Sample Size",
        "Randomized Controlled Trials (RCTs)",
        "Multi-Armed Bandit & Exploration-Exploitation",
        "Causal Inference: DoWhy & Potential Outcomes",
        "Stationarity, ACF & PACF Analysis",
        "ARIMA, SARIMA & Holt-Winters Models",
        "Time Series Decomposition",
        "Forecasting Evaluation: MAE, RMSE, MAPE",
        "PCA: Mathematics, Scree Plots & Biplots",
        "t-SNE & UMAP for Visualization",
        "Bootstrap Resampling & Jackknife",
        "Cross-Validation: k-Fold, Stratified, LOO",
        "Statistical Learning Theory",
        "Bias-Variance Tradeoff Deep Dive"
      ],
      "Module 8 — Machine Learning & Classification": [
        "Supervised vs Unsupervised vs Reinforcement Learning",
        "ML Pipeline: Data to Features to Model to Evaluate",
        "Train/Validation/Test Split & Data Leakage",
        "Scikit-learn API: fit, predict, transform",
        "Linear Regression: OLS, Ridge, Lasso, ElasticNet",
        "Polynomial Regression & Feature Engineering",
        "Regression Metrics: MSE, RMSE, MAE, R-Squared",
        "Logistic Regression & Sigmoid Function",
        "K-Nearest Neighbors (KNN)",
        "Naive Bayes: Gaussian, Multinomial, Bernoulli",
        "Decision Trees: Gini, Entropy & Pruning",
        "Support Vector Machines (SVM) & Kernels",
        "Bagging & Random Forests",
        "Gradient Boosting: Math & Intuition",
        "XGBoost, LightGBM & CatBoost",
        "Stacking & Voting Classifiers",
        "Feature Selection: Filter, Wrapper, Embedded",
        "Hyperparameter Tuning: GridSearch & Optuna",
        "Handling Imbalanced Data: SMOTE & Class Weights",
        "Classification Metrics: Precision, Recall, F1, ROC-AUC",
        "Clustering: K-Means, DBSCAN & Hierarchical"
      ],
      "Module 9 — Model Optimization & Deep Learning": [
        "Perceptron, MLP & Universal Approximation Theorem",
        "Activation Functions: ReLU, Sigmoid, Tanh, GELU",
        "Backpropagation: Chain Rule & Gradient Flow",
        "Loss Functions: Cross-Entropy, MSE, Huber",
        "Optimizers: SGD, Momentum, Adam, AdamW",
        "Tensors, Computational Graph & Eager Execution",
        "Building Models: Sequential & Functional API (Keras)",
        "Custom Layers, Losses & Training Loops",
        "Callbacks: EarlyStopping, ModelCheckpoint, LR Scheduler",
        "Batch Normalization & Layer Normalization",
        "Dropout, L1 & L2 Regularization",
        "Learning Rate Scheduling & Warmup",
        "Convolutional Layers, Pooling & Receptive Field",
        "CNN Architectures: LeNet, AlexNet, VGG, ResNet",
        "Transfer Learning & Fine-Tuning with Keras",
        "Image Augmentation & Data Generators",
        "Object Detection: YOLO Overview",
        "RNN, LSTM & GRU: Architecture & Use Cases",
        "Time Series Forecasting with LSTM",
        "PyTorch Tensors, Autograd & Custom Training Loop",
        "Model Export: ONNX & TorchScript"
      ],
      "Module 10 — GenAI & MLOps": [
        "Attention Mechanism: Scaled Dot-Product & Multi-Head",
        "Transformer Architecture: Encoder, Decoder, Positional Encoding",
        "BERT, GPT, T5 & LLaMA Family Overview",
        "Tokenization: BPE, WordPiece & SentencePiece",
        "Context Windows, Temperature & Sampling Strategies",
        "Zero-Shot, Few-Shot & Chain-of-Thought Prompting",
        "Prompt Templates, System Prompts & Role Prompting",
        "RAG: Retrieval-Augmented Generation Architecture",
        "Vector Databases: Pinecone, Chroma & FAISS",
        "LangChain: Chains, Agents & Memory",
        "Supervised Fine-Tuning (SFT) on Custom Data",
        "PEFT: LoRA, QLoRA & Adapters",
        "RLHF & Constitutional AI Overview",
        "Hugging Face: Transformers, Datasets & PEFT Library",
        "Running Local LLMs: Ollama & llama.cpp",
        "ML Experiment Tracking: MLflow & Weights & Biases",
        "Model Registry, Versioning & Lineage",
        "CI/CD for ML: GitHub Actions + DVC",
        "Model Serving: FastAPI + Docker + Kubernetes",
        "Monitoring: Data Drift, Model Decay & Alerting",
        "Capstone: RAG-Powered PDF Chatbot",
        "Capstone: End-to-End MLOps Pipeline"
      ]
    },
    topicContent: {
      "Python Setup, Environments & Jupyter Notebooks": {
        title: "Python Setup, Environments & Jupyter Notebooks",
        description: "Set up a professional Python data science environment used at top AI labs like Google Brain and DeepMind. Learn reproducible project structure, dependency management, and Jupyter best practices from day one.",
        sections: [
          { heading: "Why Environment Management Matters", text: "Reproducibility is the foundation of professional data science. If your code works on your machine but fails on a server or a colleague's laptop, it has zero value in production. Environment management with conda or venv creates sandboxed, isolated environments per project. Create one with: conda create -n ds_env python=3.11 && conda activate ds_env. Always export: conda env export > environment.yml so any teammate can recreate your exact setup with one command." },
          { heading: "JupyterLab Workflow", text: "Jupyter is the de facto standard used at every major AI research lab — from Google Brain to OpenAI. Launch with: jupyter lab. Key professional practices: name notebooks chronologically (01_eda.ipynb, 02_features.ipynb), use %timeit for profiling code speed, %matplotlib inline for inline plots, and always Restart & Run All before sharing to prove end-to-end reproducibility. Markdown cells between code cells make notebooks self-documenting." },
          { heading: "Professional Project Structure", text: "Follow the Cookiecutter Data Science template: /data (raw, processed, external), /notebooks (numbered by stage), /src (importable Python modules), /models (serialized artifacts), /reports (figures and HTML). Never commit raw data or model weights to Git — use .gitignore for data and DVC (Data Version Control) for large file tracking. This structure is used at Spotify, Airbnb, and Netflix data teams." },
          { heading: "Essential Developer Tools", text: "Black for automatic code formatting, isort for import sorting, flake8 for linting — configure all three in pyproject.toml and enforce via pre-commit hooks. VS Code with the Python and Jupyter extensions gives you IntelliSense autocomplete inside notebooks. nbstripout strips notebook outputs before Git commits so diffs stay clean and readable." },
          { heading: "Practice Exercise", text: "Create a conda environment named ml_project with Python 3.11. Install numpy, pandas, matplotlib, and jupyterlab. Launch JupyterLab, create a notebook with markdown section headers, run a simple pandas DataFrame operation, and export your environment.yml. This is your reproducible foundation for every project in this course." }
        ]
      },
      "Attention Mechanism: Scaled Dot-Product & Multi-Head": {
        title: "Attention Mechanism: Scaled Dot-Product & Multi-Head Attention",
        description: "The single most important architectural innovation in modern AI. Every transformer — BERT, GPT-4, LLaMA, Gemini — is built on this mechanism. Understanding it mathematically is non-negotiable for serious AI engineering.",
        sections: [
          { heading: "The Core Intuition", text: "Attention answers the question: when processing this token, which other tokens in the sequence should I focus on? Before attention, RNNs processed sequences step-by-step and lost long-range context due to vanishing gradients. Attention gives every position direct access to every other position in a single operation — O(1) path length regardless of sequence distance. This is why transformers handle 100,000-token documents where RNNs completely failed." },
          { heading: "Scaled Dot-Product Attention Mathematics", text: "Attention(Q, K, V) = softmax(QK-transpose / sqrt(d_k)) times V. Q (queries), K (keys), and V (values) are three different linear projections of the same input. QK-transpose computes a similarity score between every query and every key — producing an n x n attention matrix. Dividing by sqrt(d_k) prevents the dot products from growing too large (which would push softmax into saturation regions with near-zero gradients). Softmax converts scores to probabilities, and multiplying by V gives a weighted sum." },
          { heading: "Multi-Head Attention", text: "MultiHead(Q,K,V) = Concat(head_1, ..., head_h) times W_O where each head runs independent attention with different learned projections. Running h parallel heads lets the model simultaneously attend to different relationship types — one head might capture which pronouns refer to which nouns, another captures subject-verb agreement, another captures semantic similarity. This multi-perspective view is why scaling transformers works so powerfully." },
          { heading: "Self-Attention vs Cross-Attention vs Causal", text: "In self-attention, Q, K, and V all come from the same sequence — every token attends to every other token. In causal (masked) self-attention used in GPT-style decoders, position i can only attend to positions at or before i, preventing the model from cheating by looking at future tokens during training. In cross-attention (encoder-decoder models), Q comes from the decoder while K and V come from the encoder — this is how translation models align source and target language tokens." },
          { heading: "Practice Exercise", text: "Implement scaled dot-product attention from scratch in PyTorch in under 15 lines. Verify your implementation matches nn.MultiheadAttention on identical inputs. Then visualize the 8 x 8 attention weight matrix on a sentence like 'the cat sat on the mat' using matplotlib. Observe which words each head focuses on. This builds the intuition needed to debug transformer models and understand why certain prompting patterns work." }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // TRACK 2 — FULL STACK + MOBILE
  // ══════════════════════════════════════════════════════════
  fullstack: {
    title: "Full Stack + Mobile",
    icon: "🌐",
    color: "#61dafb",
    modules: {
      "Module 1 — Web Foundations (HTML, CSS, JS)": [
        "How the Web Works: DNS, HTTP/S, TCP/IP",
        "HTML5 Semantics: header, main, section, article",
        "Forms, Inputs, Validation & Accessibility (ARIA)",
        "SEO Fundamentals: Meta Tags, OpenGraph, Schema.org",
        "Box Model, Display & Positioning",
        "Flexbox: Complete Guide with Real Layouts",
        "CSS Grid: Template Areas, Auto-Fit & Minmax",
        "Responsive Design: Media Queries & Mobile-First",
        "CSS Variables, Animations & Transitions",
        "Tailwind CSS: Utility-First Workflow",
        "Variables: var vs let vs const, Hoisting & Scope",
        "Data Types, Type Coercion & Equality",
        "Functions: Declaration, Expression, Arrow & IIFE",
        "Arrays & Objects: Methods, Destructuring, Spread",
        "DOM Manipulation & Event Handling",
        "Fetch API, Promises & async/await",
        "Closures, Currying & Higher-Order Functions",
        "Prototype Chain & Class Syntax (ES6+)",
        "Modules: import/export & Dynamic Imports",
        "Web Performance: Lighthouse & Core Web Vitals"
      ],
      "Module 2 — React (Web)": [
        "JSX, Virtual DOM & Reconciliation Algorithm",
        "Function Components vs Class Components",
        "Props: Passing, Destructuring & PropTypes",
        "useState & Controlled Components",
        "useEffect: Lifecycle, Dependencies & Cleanup",
        "Conditional Rendering & List Rendering with Keys",
        "useRef, useCallback & useMemo",
        "useReducer for Complex State Logic",
        "Context API: createContext, Provider, useContext",
        "Custom Hooks: Extraction & Reusability Patterns",
        "React Router v6: Routes, Params & Nested Routing",
        "Forms: Controlled, Uncontrolled & React Hook Form",
        "Redux Toolkit: Slices, Thunks & RTK Query",
        "React Query (TanStack): Server State Management",
        "Code Splitting, React.lazy & Suspense",
        "Error Boundaries & Fallback UIs",
        "Performance: memo, virtualization & Profiler",
        "Testing: Jest, React Testing Library & Cypress",
        "Vite: Project Setup, Plugins & Build Optimization",
        "Next.js: SSR, SSG, ISR & App Router",
        "Deployment: Vercel, Netlify & Custom CI/CD"
      ],
      "Module 3 — React Native (Mobile)": [
        "How React Native Works: Bridge & New Architecture",
        "Expo vs Bare React Native: When to Use What",
        "Core Components: View, Text, Image, ScrollView",
        "StyleSheet API vs NativeWind (Tailwind for RN)",
        "Flexbox in React Native: Differences from Web",
        "React Navigation: Stack, Tab & Drawer Navigators",
        "Deep Linking & Universal Links",
        "AsyncStorage & SecureStore for Local Data",
        "Zustand & Redux Toolkit in React Native",
        "Fetching Data: Axios, React Query & SWR",
        "Camera, Gallery & Image Picker",
        "Geolocation & Maps (react-native-maps)",
        "Push Notifications: Expo & Firebase FCM",
        "Biometric Authentication & Permissions API",
        "Offline Support & Background Tasks",
        "EAS Build: Android APK/AAB & iOS IPA",
        "Google Play Store Submission Guide",
        "Apple App Store Submission Guide",
        "OTA Updates with EAS Update",
        "Performance Profiling & Hermes Engine"
      ],
      "Module 4 — Django Backend": [
        "MTV Architecture & Django Request/Response Cycle",
        "Models: Field Types, Relationships & Meta Options",
        "ORM Queries: filter, exclude, annotate, aggregate",
        "Views: Function-Based vs Class-Based Views",
        "URL Routing, Namespacing & Reverse URLs",
        "Templates, Template Tags & Context Processors",
        "Serializers: ModelSerializer & Custom Validation",
        "APIView, GenericView & ViewSets (DRF)",
        "Routers & Automatic URL Generation",
        "Authentication: Session, Token & JWT (simplejwt)",
        "Permissions: IsAuthenticated, IsOwner & Custom",
        "Pagination, Filtering & Search (django-filter)",
        "Custom User Model & Auth Backend",
        "Signals: pre_save, post_save, m2m_changed",
        "Celery + Redis: Async Tasks & Scheduled Jobs",
        "Django Channels & WebSockets",
        "Caching: Memcached, Redis & Per-View Cache",
        "Security: CSRF, XSS, SQL Injection, HTTPS Headers",
        "Unit Testing: TestCase & APITestCase",
        "Swagger/OpenAPI Docs with drf-spectacular",
        "Django Admin Customization & Bulk Actions"
      ],
      "Module 5 — Databases & APIs": [
        "PostgreSQL vs MySQL: Advanced Feature Comparison",
        "Advanced Data Types: JSONB, Arrays, UUID",
        "Full-Text Search with tsvector & tsquery",
        "Database Indexing Strategy & VACUUM",
        "Connection Pooling with PgBouncer",
        "MongoDB Document Model vs Relational Model",
        "MongoDB CRUD & Query Language",
        "Aggregation Pipeline: match, group, lookup",
        "Schema Design Patterns for NoSQL",
        "Redis Data Structures: String, Hash, List, Set",
        "Redis as Cache, Session Store & Message Broker",
        "Pub/Sub & Redis Streams",
        "REST API Design: Resources, Verbs & Status Codes",
        "GraphQL: Schema, Queries, Mutations & Subscriptions",
        "API Security: OAuth 2.0, API Keys & Rate Limiting",
        "API Documentation: OpenAPI 3.0 & Postman",
        "Webhooks, Event-Driven Architecture & SSE"
      ],
      "Module 6 — AI Integration in Apps": [
        "OpenAI API: Chat Completions, Embeddings & Vision",
        "Anthropic Claude API & System Prompts",
        "Streaming Responses & Real-Time UX Patterns",
        "Function Calling & Structured Outputs",
        "AI-Powered Search with Embeddings & Cosine Similarity",
        "RAG Pipeline in Django: Embed, Store, Retrieve, Generate",
        "AI Chat Interface in React with Streaming",
        "Image Generation: DALL-E & Stable Diffusion APIs",
        "Speech-to-Text (Whisper) & TTS Integration",
        "On-Device ML with TensorFlow Lite in React Native",
        "Image Classification in Mobile Apps",
        "Real-Time Object Detection with Camera Feed",
        "AI Chatbot in React Native with Voice Input",
        "Prompt Management & Version Control",
        "AI Cost Optimization & Token Management",
        "Evaluating & A/B Testing AI Features"
      ],
      "Module 7 — Deploy (Web + Android + iOS)": [
        "DNS, Domains & HTTPS with Lets Encrypt",
        "VPS Deployment: Ubuntu + Nginx + Gunicorn",
        "Docker & Docker Compose for Full Stack Apps",
        "GitHub Actions: CI/CD Pipeline for Django + React",
        "AWS: EC2, S3, RDS & CloudFront CDN",
        "Render, Railway & Vercel for Quick Deployments",
        "EAS Build: Managed & Bare Workflow for Mobile",
        "Code Signing: Android Keystore & iOS Certificates",
        "Google Play: Internal to Alpha to Beta to Production",
        "App Store Connect: TestFlight & App Review Process",
        "OTA Updates with EAS Update (No Store Review)",
        "Linux Commands Every Developer Must Know",
        "Nginx Configuration, Reverse Proxy & SSL Termination",
        "Environment Variables & Secrets Management",
        "Monitoring: Sentry, UptimeRobot & Datadog",
        "Database Backups & Disaster Recovery",
        "Scaling Strategies: Horizontal vs Vertical"
      ],
      "Module 8 — Capstone Projects (Full Stack)": [
        "System Design for Full Stack Applications",
        "Database Schema Design & ERD Creation",
        "Monorepo Setup with Turborepo",
        "Choosing the Right Tech Stack",
        "Capstone 1: SaaS Platform (Django + React + Stripe)",
        "Capstone 2: Real-Time Chat App (WebSockets + React)",
        "Capstone 3: AI-Powered Mobile App (React Native + GenAI)",
        "Capstone 4: E-Commerce Platform with Admin Dashboard",
        "System Design Interview: Concepts & Practice",
        "Building a Professional Portfolio & GitHub Profile",
        "Technical Interview Prep: DSA & Take-Home Projects",
        "Freelancing, Open Source & Getting Your First Job"
      ]
    },
    topicContent: {
      "How the Web Works: DNS, HTTP/S, TCP/IP": {
        title: "How the Web Works: DNS, HTTP/S, TCP/IP",
        description: "Before writing a single line of code, understand the infrastructure that delivers every webpage in milliseconds. This foundational knowledge separates developers who debug blindly from those who diagnose issues systematically.",
        sections: [
          { heading: "The Request-Response Cycle", text: "When you type seekhowithrua.com in a browser: first the browser checks its DNS cache. If not found, it queries a DNS resolver which traverses Root nameservers, then TLD (.com) nameservers, then the authoritative nameserver to get the IP address. Next comes a TCP three-way handshake (SYN, SYN-ACK, ACK). For HTTPS, a TLS handshake follows to negotiate encryption. The browser sends an HTTP GET request, and the server responds with HTML. The browser parses the HTML, discovers CSS, JavaScript, and image files, and fires parallel requests for each. This entire chain typically completes in under 300 milliseconds on a fast connection." },
          { heading: "HTTP/1.1 vs HTTP/2 vs HTTP/3", text: "HTTP/1.1 opens one TCP connection per request, causing head-of-line blocking where later requests queue behind slow ones. HTTP/2 introduced multiplexing (multiple requests over one TCP connection), header compression via HPACK, and server push. HTTP/3 replaces TCP with QUIC which is UDP-based, eliminating TCP head-of-line blocking entirely and improving performance on unreliable mobile networks. Open Chrome DevTools Network tab on any site and you can see which protocol each resource uses." },
          { heading: "HTTP Methods & Status Codes", text: "GET retrieves data and is idempotent and cacheable. POST creates resources. PUT replaces a resource entirely. PATCH partially updates it. DELETE removes it. Status codes: 2xx means success, 3xx means redirect, 4xx means client error (404 Not Found, 401 Unauthorized, 403 Forbidden, 422 Validation Error), and 5xx means server error (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable). Mastering every status code is essential for building and debugging production APIs." },
          { heading: "HTTPS & TLS Internals", text: "HTTP sends data as plaintext — anyone on the same network can read every byte. HTTPS wraps HTTP in TLS (Transport Layer Security). TLS uses asymmetric encryption (RSA or ECDSA) for the initial handshake to securely exchange a symmetric session key. Then it switches to symmetric encryption (AES-256-GCM) for the actual data, because symmetric encryption is thousands of times faster. Certificates are signed by trusted Certificate Authorities. Let's Encrypt provides free auto-renewing certificates via the ACME protocol." },
          { heading: "Practice Exercise", text: "Open Chrome DevTools and navigate to the Network tab. Visit any major website and analyze each request: DNS lookup time, TCP connect time, TLS negotiation time, Time to First Byte (TTFB), and content download time. Then open a terminal and run: curl -I https://seekhowithrua.com to see raw HTTP response headers. Run nslookup seekhowithrua.com to trace DNS resolution live." }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // TRACK 3 — GAME + IoT + AI
  // ══════════════════════════════════════════════════════════
  game_iot: {
    title: "Game + IoT + AI",
    icon: "🎮",
    color: "#ff6b6b",
    modules: {
      "Module 1 — Game Design Fundamentals": [
        "What Makes a Game Fun? The MDA Framework",
        "Core Game Loops, Feedback & Progression Systems",
        "Game Genres & Market Analysis",
        "Player Psychology: Flow State, Rewards & Motivation",
        "Game Design Document (GDD): Structure & Templates",
        "Mechanics, Dynamics & Aesthetics Deep Dive",
        "Level Design Principles & Pacing",
        "Prototyping: Paper Prototype to Digital MVP",
        "2D Art Pipeline: Concept to Sprite to Animation",
        "Color Theory, Visual Hierarchy & UI/UX for Games",
        "Game Audio: SFX, Music & Adaptive Soundtracks",
        "Asset Creation with Aseprite & Krita",
        "Monetization: Premium, F2P, Subscription & DLC",
        "Publishing: Steam, Google Play & App Store",
        "Game Jams: itch.io, Ludum Dare & Global Game Jam",
        "Indie Game Post-Mortems & Case Studies"
      ],
      "Module 2 — Unity & C#": [
        "C# Fundamentals: Variables, Types & Control Flow",
        "Classes, Inheritance, Interfaces & Polymorphism",
        "Collections: List, Dictionary, Queue, Stack",
        "Delegates, Events & Lambda Expressions",
        "Coroutines & async/await in Unity",
        "LINQ for Game Data Processing",
        "Unity Editor: Scene, Hierarchy, Project & Inspector",
        "GameObjects, Components & Transform System",
        "Physics Engine: Rigidbody, Colliders & Triggers",
        "Input System (New): Actions, Bindings & Player Input",
        "Unity Animation: Animator Controller & Blend Trees",
        "Audio Manager: AudioSource, AudioMixer & 3D Sound",
        "ScriptableObjects for Game Data Architecture",
        "Object Pooling for Performance Optimization",
        "Scene Management & Async Loading",
        "UI Toolkit & Canvas System",
        "Shader Graph: Custom Visual Effects",
        "Cinemachine: Dynamic Camera Systems",
        "Unity DOTS: ECS, Burst Compiler & Job System",
        "Optimization: Profiler, Draw Calls & LOD Groups",
        "Build Pipeline: PC, Android, iOS & WebGL"
      ],
      "Module 3 — Unreal Engine 5": [
        "Unreal Engine Architecture: Actors, Components, World",
        "Blueprints Visual Scripting: Nodes, Graphs & Events",
        "Level Design in UE5: Landscapes & World Partition",
        "Materials, Textures & PBR Rendering Workflow",
        "Unreal C++: UCLASS, UPROPERTY, UFUNCTION Macros",
        "GameMode, GameState, PlayerController & Pawn",
        "Unreal Reflection System & Garbage Collection",
        "Extending Blueprints with C++ Classes",
        "Nanite: Virtualized Geometry System",
        "Lumen: Real-Time Global Illumination",
        "MetaHumans & Character Animation System",
        "Chaos Physics & Destruction System",
        "Niagara VFX: Particle Systems & GPU Simulations",
        "Control Rig & Full-Body IK Animation",
        "Mass AI: Crowd Simulation at Scale",
        "Network Replication in Unreal for Multiplayer",
        "Packaging & Distribution: PC, Console & Mobile"
      ],
      "Module 4 — AI in Games": [
        "Finite State Machines (FSM) for Enemy Behavior",
        "Behavior Trees: Selector, Sequence & Decorators",
        "Pathfinding: A* Algorithm & NavMesh Navigation",
        "Steering Behaviors: Seek, Flee, Arrive & Flocking",
        "Decision Making: Utility AI & GOAP Planning",
        "Unity ML-Agents: Installation & Architecture",
        "Reinforcement Learning: Reward Shaping & Curriculum",
        "Training Agents with PPO & SAC Algorithms",
        "Self-Play: Training Competitive AI Agents",
        "Imitation Learning from Human Demonstrations",
        "Procedural Level Generation: Wave Function Collapse",
        "Perlin Noise for Terrain & World Generation",
        "Procedural Narrative & Dialogue Systems",
        "AI NPC Conversations with LLM Memory",
        "Generative AI for Game Art: Midjourney & SD",
        "AI Audio Generation: ElevenLabs & Suno for Games"
      ],
      "Module 5 — IoT Foundations (Arduino, Raspberry Pi)": [
        "Electricity Fundamentals: Voltage, Current, Resistance",
        "Ohm's Law, Kirchhoff's Laws & Circuit Analysis",
        "Basic Components: Resistors, Capacitors, LEDs, Transistors",
        "Breadboard Prototyping & Schematic Reading",
        "Arduino Architecture: ATmega, Pins & Memory",
        "Arduino IDE & C++ for Embedded Systems",
        "Digital I/O: Reading Buttons, Driving LEDs",
        "Analog I/O: ADC, PWM & Analog Sensors",
        "Serial Communication: UART, I2C, SPI Protocols",
        "Sensors: Temperature, Ultrasonic, PIR, Flex, Soil",
        "Actuators: Servo, DC Motor, Stepper & H-Bridge",
        "LCD Displays, OLED & 7-Segment Displays",
        "Raspberry Pi Hardware Overview & OS Setup",
        "GPIO with Python: RPi.GPIO & gpiozero",
        "Camera Module & Computer Vision with OpenCV",
        "Raspberry Pi as Web Server: Flask + Nginx",
        "Interfacing Arduino with Raspberry Pi",
        "WiFi with ESP8266 & ESP32",
        "Bluetooth & BLE Communication",
        "MQTT Protocol: Broker, Publisher & Subscriber",
        "LoRa & Long-Range IoT Communication"
      ],
      "Module 6 — Edge AI & TinyML": [
        "What is TinyML? Constraints & Opportunities",
        "Microcontroller vs Microprocessor for AI",
        "TensorFlow Lite: Model Conversion & Optimization",
        "Quantization: INT8, FP16 & Post-Training",
        "Pruning & Knowledge Distillation for Edge Models",
        "Arduino Nano 33 BLE Sense: Built-in ML Sensors",
        "Edge Impulse: Data Collection, Training & Deployment",
        "Keyword Spotting on Microcontroller",
        "Gesture Recognition with IMU Data",
        "Anomaly Detection for Predictive Maintenance",
        "OpenCV for Real-Time Computer Vision on Pi",
        "TensorFlow Lite Object Detection on Raspberry Pi",
        "Coral Edge TPU: Google AI Accelerator",
        "NVIDIA Jetson Nano for Edge Deep Learning",
        "Face Recognition System on Raspberry Pi",
        "ONNX Runtime for Cross-Platform Inference",
        "Optimizing Models for Battery-Powered Devices",
        "Over-the-Air (OTA) Model Updates for IoT",
        "Privacy-Preserving AI: Federated Learning Basics"
      ],
      "Module 7 — IoT + Game Integration Projects": [
        "Bridging Physical Controllers to Games via Arduino",
        "Custom Game Controllers: Buttons, Joysticks, Force Sensors",
        "Haptic Feedback: Vibration Motors & Force Feedback",
        "BLE Game Controllers with ESP32",
        "Real-World Data as Game Variables (Weather, Temp)",
        "Biometric Gaming: Heart Rate & EEG Sensors",
        "AR Markers (ArUco) with Physical Game Boards",
        "Unity + MQTT: Real-Time IoT Events in Game World",
        "Smart Home Dashboard: Raspberry Pi + React",
        "IoT Security System with Camera & AI Detection",
        "Agricultural IoT: Soil Sensors + ML Prediction",
        "Project: Physical Puzzle Game with Arduino + Unity",
        "Project: IoT Smart Car with CV Navigation",
        "Project: Wearable Sensor Game Controller",
        "Project: AI-Powered Home Automation System"
      ],
      "Module 8 — Capstone Projects (Game + IoT)": [
        "Capstone Scoping, Timeline & Milestone Planning",
        "Hardware + Software Architecture Design",
        "Version Control for Hardware Projects with Git",
        "Documentation: README, Schematic & Demo Video",
        "Capstone 1: Complete 2D Game in Unity (Published)",
        "Capstone 2: AAA-Quality Scene in Unreal Engine 5",
        "Capstone 3: Intelligent IoT System with Edge AI",
        "Capstone 4: AI-Powered Game with ML Agents",
        "Building a Technical Portfolio for Game Studios",
        "Game Dev Career Paths: AAA, Indie, Mobile & XR",
        "Pitching Your Game to Publishers & Investors"
      ]
    },
    topicContent: {
      "Unity ML-Agents: Installation & Architecture": {
        title: "Unity ML-Agents: Installation & Architecture",
        description: "Unity ML-Agents is the open-source reinforcement learning framework behind award-winning AI game demos. Learn to turn any Unity GameObject into a learning agent — using the same deep RL techniques from AlphaGo and OpenAI Five.",
        sections: [
          { heading: "What is ML-Agents?", text: "Unity ML-Agents Toolkit lets you turn any Unity GameObject into an agent that discovers intelligent behavior through trial and error rather than hand-coded rules. It has been used to train agents in commercial games, simulate robot locomotion, and create NPCs that adapt dynamically to individual player strategies during runtime." },
          { heading: "System Architecture: Three Layers", text: "The system has three components working together. First, the Unity Environment: the simulation where agents live, perceive the world, and execute actions — running at thousands of steps per second. Second, the Python Training API (the mlagents package): runs PPO or SAC learning algorithms and communicates with Unity via gRPC protocol. Third, the PyTorch Neural Network: the actual brain that maps observations to actions, updated via backpropagation from experience tuples." },
          { heading: "The Four Core Concepts", text: "Every agent inherits from the Agent class and implements two key methods. CollectObservations() defines what the agent perceives — positions, velocities, ray perception sensors, or raw camera pixels. OnActionReceived() defines how the agent acts on the environment and receives its reward signal. The reward function is the hardest design decision in all of RL: sparse rewards (only at the final goal) are theoretically clean but extremely hard to learn from; dense rewards (small signal each step toward the goal) guide learning faster but can cause unintended shortcut behaviors." },
          { heading: "Running Your First Training Session", text: "Install the package with: pip install mlagents. Add the ML-Agents package in Unity Package Manager. Create an Agent script, attach BehaviorParameters (set 2 continuous actions for 2D movement) and DecisionRequester (request decisions every 5 steps). Define rewards: plus 1.0 for reaching the target, minus 0.01 per step as a time penalty, minus 1.0 for falling off the platform. Start training with: mlagents-learn config/ppo.yaml --run-id=FirstRun. Watch the reward curve in TensorBoard rise from random noise to purposeful navigation in about 500,000 steps (roughly 10 minutes on a modern laptop)." },
          { heading: "Practice Exercise", text: "Recreate the classic PushBlock example from scratch without using the provided assets. Build a cube agent that must push a block onto a target platform. Define a 10-dimensional observation vector containing agent position, block position, target position, and the relevant distances. Use 2 continuous actions (move X, move Z). Set rewards as described above. Train for 1 million steps with PPO. Plot the mean reward curve in TensorBoard. This single project teaches every core RL concept: observation design, action space definition, reward shaping, and reading training diagnostics." }
        ]
      }
    }
  }
};

// ── Default content generator (fallback for topics without custom content) ──
export const generateDefaultContent = (topic) => ({
  title: topic,
  description: `Master ${topic} with rigorous, hands-on instruction at Stanford CS and Harvard SEAS depth. Core theory, practical implementation, and real-world engineering patterns used at top tech companies and research labs worldwide.`,
  sections: [
    {
      heading: "Core Theory & Intuition",
      text: "Every concept is taught from first principles — not to be abstract, but because understanding why something works makes you dramatically more effective at applying and debugging it in production. This section builds the mental model you will carry for years."
    },
    {
      heading: "Implementation Deep Dive",
      text: "We implement this concept from scratch, then examine how professional libraries and frameworks handle the same problem. Understanding the from-scratch version means you will never be blocked by a black-box library — you can always go one level deeper and fix it yourself."
    },
    {
      heading: "Industry Patterns & Best Practices",
      text: "This is how engineers at Google, Meta, Netflix, and top-tier startups actually use this concept in production systems. We cover common pitfalls, edge cases, performance considerations, and the design decisions that separate a working prototype from a production-grade system."
    },
    {
      heading: "Common Mistakes & How to Avoid Them",
      text: "Every learner hits the same walls with this topic. This section documents the most frequent errors, misconceptions, and debugging challenges — and exactly how to resolve each one. Years of teaching experience compressed into actionable, specific guidance."
    },
    {
      heading: "Practice Exercise",
      text: "Apply everything from this topic with a structured exercise designed to expose any gaps in understanding. Complete it before moving on — active coding practice produces retention rates 4 to 5 times higher than passive reading alone. Struggling productively on this exercise is the point."
    }
  ]
});

export const SYLLABUS_STORAGE_KEY = "cosmos_syllabus_data";

export const loadSyllabusData = () => {
  try {
    const stored = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = { ...defaultSyllabusData };
      Object.keys(parsed).forEach(key => {
        merged[key] = {
          ...defaultSyllabusData[key],
          ...parsed[key],
          topicContent: {
            ...(defaultSyllabusData[key]?.topicContent || {}),
            ...(parsed[key]?.topicContent || {})
          }
        };
      });
      return merged;
    }
  } catch (e) {
    console.warn("Failed to load syllabus from storage:", e);
  }
  return JSON.parse(JSON.stringify(defaultSyllabusData));
};

export const saveSyllabusData = (data) => {
  try {
    localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save syllabus:", e);
    return false;
  }
};

export const resetSyllabusData = () => {
  localStorage.removeItem(SYLLABUS_STORAGE_KEY);
  return JSON.parse(JSON.stringify(defaultSyllabusData));
};

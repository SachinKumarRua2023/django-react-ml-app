// ============================================================
// COURSE DATA — Harvard / Stanford Level
// Three Courses: Data Science & AI | Full Stack Development | Robotics
// ============================================================

export const syllabusData = {
  datascience: {
    title: "Data Science & AI",
    icon: "📊",
    color: "#a855f7",
    modules: {
      "Statistics & Probability Foundations": [
        "Descriptive Statistics & Distributions",
        "Probability Theory & Axioms",
        "Random Variables & Expectation",
        "Central Limit Theorem & Law of Large Numbers",
        "Hypothesis Testing & p-values",
        "Confidence Intervals & Estimation",
        "Bayesian Inference & Bayes Theorem",
        "A/B Testing & Experimental Design"
      ],
      "Linear Algebra for ML": [
        "Vectors, Matrices & Tensors",
        "Matrix Operations & Transformations",
        "Eigenvalues, Eigenvectors & PCA",
        "Singular Value Decomposition (SVD)",
        "Dot Products, Norms & Projections",
        "Gradient & Jacobian in Deep Learning"
      ],
      "Python for Data Science": [
        "NumPy — Vectorized Computing",
        "Pandas — DataFrames & Data Wrangling",
        "Matplotlib & Seaborn — Visualization",
        "Scikit-Learn — ML Pipeline",
        "Feature Engineering & Preprocessing",
        "Data Cleaning & Missing Values"
      ],
      "Classical Machine Learning": [
        "Linear & Polynomial Regression",
        "Logistic Regression & Decision Boundary",
        "Regularization: L1, L2, ElasticNet",
        "Decision Trees & Information Gain",
        "Random Forests & Gradient Boosting",
        "Support Vector Machines (SVM & Kernels)",
        "K-Means, DBSCAN & Clustering",
        "Dimensionality Reduction: t-SNE, UMAP"
      ],
      "Deep Learning & Neural Networks": [
        "Perceptron, Activation Functions & MLP",
        "Backpropagation & Chain Rule",
        "Optimizers: SGD, Adam, RMSProp",
        "Batch Normalization & Dropout",
        "Convolutional Neural Networks (CNN)",
        "Recurrent Networks: LSTM & GRU",
        "Transfer Learning & Fine-Tuning",
        "PyTorch — Building Networks from Scratch"
      ],
      "Generative AI & LLMs": [
        "Transformer Architecture Deep Dive",
        "Attention Mechanism & Self-Attention",
        "BERT, GPT, T5 — Pre-trained Models",
        "Prompt Engineering & Chain-of-Thought",
        "RAG — Retrieval Augmented Generation",
        "Fine-Tuning with LoRA & PEFT",
        "Vector Databases: Pinecone, Chroma, FAISS",
        "LangChain & LlamaIndex Pipelines",
        "Diffusion Models & Image Generation",
        "AI Ethics, Bias & Responsible AI"
      ],
      "Production ML Systems": [
        "MLOps & ML Lifecycle Management",
        "Model Evaluation: ROC, AUC, F1, PR Curves",
        "Feature Stores & Data Versioning (DVC)",
        "Model Serving: FastAPI & TorchServe",
        "Docker & Kubernetes for ML",
        "Monitoring & Model Drift Detection",
        "End-to-End ML Project Walkthrough"
      ]
    }
  },

  fullstack: {
    title: "Full Stack Development",
    icon: "🌐",
    color: "#00d9ff",
    modules: {
      "Web Fundamentals": [
        "How the Web Works: HTTP, DNS, TCP/IP",
        "HTML5 Semantics & Accessibility (ARIA)",
        "CSS3: Flexbox, Grid & Responsive Design",
        "JavaScript ES2024 — Core Language Deep Dive",
        "DOM Manipulation & Browser APIs",
        "Asynchronous JS: Promises, async/await, Event Loop"
      ],
      "React — Modern Frontend": [
        "React Architecture & Virtual DOM",
        "JSX, Components, Props & State",
        "Hooks In Depth: useState, useEffect, useRef, useMemo, useCallback",
        "Context API & Global State Patterns",
        "React Query (TanStack) — Server State",
        "Zustand & Redux Toolkit — Client State",
        "React Router v6 — SPA Navigation",
        "Performance: Code Splitting, Lazy Loading, React.memo",
        "Testing: Jest, React Testing Library, Vitest",
        "React 19 Features: Server Components & Actions"
      ],
      "Next.js — Full Stack React": [
        "Next.js App Router & File System Routing",
        "Server Components vs Client Components",
        "Data Fetching: SSR, SSG, ISR, Streaming",
        "Server Actions & Form Handling",
        "Middleware, Edge Runtime & Caching",
        "Authentication with NextAuth / Clerk",
        "API Routes & Route Handlers",
        "Image Optimization, SEO & Metadata API",
        "Deployment on Vercel & Edge Networks"
      ],
      "React Native & Expo — Mobile": [
        "React Native Architecture: New vs Old",
        "Expo SDK & EAS Build System",
        "Core Components: View, Text, FlatList, ScrollView",
        "Navigation: React Navigation & Expo Router",
        "Platform-Specific Code: iOS & Android Differences",
        "Gestures, Animations with Reanimated 3",
        "Camera, Location & Native Device APIs",
        "Push Notifications with Expo",
        "Over-the-Air Updates (OTA)",
        "Building & Publishing to App Store / Google Play"
      ],
      "Backend — Node.js & APIs": [
        "Node.js Event Loop & Non-Blocking I/O",
        "Express.js — REST API Design",
        "GraphQL with Apollo Server",
        "Authentication: JWT, OAuth2, Sessions",
        "Input Validation & Security (Helmet, CORS, Rate Limiting)",
        "WebSockets & Real-Time with Socket.io",
        "Microservices vs Monolith Architecture",
        "gRPC & Protocol Buffers"
      ],
      "Databases & Storage": [
        "PostgreSQL — Advanced SQL & Indexing",
        "Prisma ORM — Type-Safe Database Access",
        "MongoDB & Mongoose — NoSQL Patterns",
        "Redis — Caching, Sessions & Pub/Sub",
        "Database Design: Normalization, ERDs",
        "Transactions, ACID & Concurrency Control",
        "Supabase & PlanetScale — Managed DBs"
      ],
      "DevOps & Cloud": [
        "Docker — Containerization & Compose",
        "CI/CD with GitHub Actions",
        "AWS Core Services: EC2, S3, Lambda, RDS",
        "Infrastructure as Code: Terraform Basics",
        "NGINX — Reverse Proxy & Load Balancing",
        "Monitoring: Datadog, Sentry, Uptime Checks",
        "Security: HTTPS, CSP, XSS, CSRF, SQL Injection",
        "Web Performance: Core Web Vitals, Lighthouse"
      ]
    }
  },

  robotics: {
    title: "Robotics Engineering",
    icon: "🤖",
    color: "#ff6b6b",
    modules: {
      "Math for Robotics": [
        "Coordinate Frames & Transformations",
        "Rotation Matrices, Euler Angles & Quaternions",
        "Homogeneous Coordinates & SE(3)",
        "Calculus of Variations & Optimal Control",
        "Probability & State Estimation",
        "Linear Systems & Control Theory"
      ],
      "Robot Kinematics": [
        "Forward Kinematics & Denavit-Hartenberg",
        "Inverse Kinematics: Analytical & Numerical",
        "Jacobian Matrix & Velocity Kinematics",
        "Singularities & Workspace Analysis",
        "Mobile Robot Kinematics: Differential Drive, Ackermann",
        "Kinematic Chains & URDF Models"
      ],
      "Robot Dynamics & Control": [
        "Newton-Euler & Lagrangian Dynamics",
        "PID Control & Tuning Methods",
        "State-Space Representation",
        "LQR & Optimal Control",
        "Feedforward & Model Predictive Control (MPC)",
        "Adaptive Control & Sliding Mode"
      ],
      "Sensing & Perception": [
        "LiDAR, Sonar & Depth Sensors",
        "Camera Models: Pinhole, Fisheye & Stereo",
        "Computer Vision for Robotics (OpenCV)",
        "Point Cloud Processing (PCL)",
        "Sensor Fusion: IMU + GPS + LiDAR",
        "Object Detection & Semantic Segmentation",
        "SLAM — Simultaneous Localization and Mapping"
      ],
      "Robot Operating System (ROS 2)": [
        "ROS 2 Architecture: Nodes, Topics, Services",
        "DDS Middleware & QoS Policies",
        "URDF & Robot Description",
        "Gazebo Simulation & Physics",
        "TF2 — Transform Tree Management",
        "Nav2 — Autonomous Navigation Stack",
        "MoveIt 2 — Motion Planning",
        "ROS 2 Control — Hardware Interface"
      ],
      "Path Planning & Navigation": [
        "Grid Maps, Occupancy Grids & Costmaps",
        "Dijkstra, A* & D* Lite Algorithms",
        "Rapidly-Exploring Random Trees (RRT, RRT*)",
        "Probabilistic Roadmaps (PRM)",
        "Potential Fields & Reactive Navigation",
        "Dynamic Window Approach (DWA)",
        "Multi-Robot Coordination"
      ],
      "AI & Learning in Robotics": [
        "Reinforcement Learning for Robotics (PPO, SAC)",
        "Imitation Learning & Behavioral Cloning",
        "Sim-to-Real Transfer",
        "SLAM with Deep Learning",
        "Manipulation with Learning: Grasping & Dexterous Hands",
        "Humanoid Robots & Legged Locomotion",
        "Large Language Models as Robot Brains (RT-2, PaLM-E)"
      ]
    }
  }
};

// ============================================================
// CONTENT GENERATOR — Full Harvard/Stanford level explanations
// ============================================================

const contentDatabase = {

  // ─────────────────────────────────────────────
  // DATA SCIENCE & AI
  // ─────────────────────────────────────────────

  "Descriptive Statistics & Distributions": {
    description: "The foundation of all empirical science. Before any model, you must deeply understand your data's shape, center, spread, and outliers.",
    sections: [
      {
        heading: "Measures of Central Tendency",
        text: `The **mean** (arithmetic average) μ = (1/n)Σxᵢ is sensitive to outliers. For a salary dataset with one billionaire, the mean is meaningless. The **median** (middle value when sorted) is robust to outliers and preferred for skewed distributions. The **mode** (most frequent value) applies to categorical and discrete data.

For a dataset: [2, 4, 4, 4, 5, 5, 7, 9], mean = 5, median = 4.5, mode = 4.

**Trimmed mean**: Remove top/bottom k% before computing mean. Used in Olympic scoring.`
      },
      {
        heading: "Measures of Spread",
        text: `**Variance** σ² = (1/n)Σ(xᵢ - μ)². Uses squared differences, so units are squared. **Standard deviation** σ = √σ² restores original units.

**Sample variance** uses (n-1) denominator (Bessel's correction) to get an unbiased estimator of population variance.

**IQR** (Interquartile Range) = Q3 - Q1 is robust to outliers. **MAD** (Mean Absolute Deviation) = mean|xᵢ - median| is even more robust.

**Chebyshev's inequality**: For ANY distribution, at least 1 - 1/k² of data lies within k standard deviations of the mean. For k=2, at least 75% of data lies within 2σ.`
      },
      {
        heading: "Key Distributions You Must Master",
        text: `**Normal (Gaussian)**: Bell curve, defined by μ and σ. The 68-95-99.7 rule: 68% within 1σ, 95% within 2σ, 99.7% within 3σ. Central to the Central Limit Theorem. PDF: f(x) = (1/σ√2π) exp(-(x-μ)²/2σ²)

**Bernoulli(p)**: Single trial, success=1 with probability p. E[X]=p, Var[X]=p(1-p).

**Binomial(n,p)**: Sum of n independent Bernoulli trials. P(X=k) = C(n,k)·pᵏ·(1-p)^(n-k). Models coin flips, A/B tests.

**Poisson(λ)**: Counts of rare events in fixed time/space. P(X=k) = λᵏe^(-λ)/k!. Models website clicks/hour, calls to a center. λ = mean = variance.

**Exponential(λ)**: Time BETWEEN Poisson events. Memoryless property: P(X>s+t|X>s) = P(X>t). Models hardware failure times.

**Student's t**: Like normal but heavier tails — used when sample size is small (<30) or population variance is unknown. As df→∞, approaches normal.

**Chi-squared (χ²)**: Sum of squared standard normals. Used in goodness-of-fit tests and contingency tables.

**Uniform(a,b)**: Every value equally likely. E[X]=(a+b)/2, Var[X]=(b-a)²/12.`
      },
      {
        heading: "Skewness, Kurtosis & QQ Plots",
        text: `**Skewness** measures asymmetry. Positive skew (right tail): income, house prices. Negative skew: exam scores in easy tests. Formula: (1/n)Σ((xᵢ-μ)/σ)³

**Kurtosis** measures tail heaviness. Normal distribution has kurtosis=3. Excess kurtosis = kurtosis-3. Heavy tails (leptokurtic, kurtosis>3): financial returns. Light tails (platykurtic): uniform distribution.

**QQ Plot** (Quantile-Quantile): Plots sample quantiles against theoretical normal quantiles. Points on the diagonal line = data is normal. S-curves indicate heavy tails. Deviations in tails indicate skewness. Essential diagnostic before applying parametric tests.`
      },
      {
        heading: "Practice: Real Analysis",
        text: `Load the Boston Housing dataset. Compute the full descriptive statistics table. Plot histograms of MEDV (median home value) — is it normal? Compute skewness and kurtosis. Create a QQ plot. Identify outliers using the 1.5*IQR rule. What transformation (log, sqrt, Box-Cox) makes MEDV approximately normal? Verify with the Shapiro-Wilk normality test (p>0.05 means fail to reject normality).

\`\`\`python
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

df = pd.read_csv('boston.csv')
x = df['MEDV']
print(f"Mean: {x.mean():.2f}, Median: {x.median():.2f}")
print(f"Std: {x.std():.2f}, Skewness: {x.skew():.4f}")
print(f"Kurtosis: {x.kurtosis():.4f}")

# QQ plot
fig, ax = plt.subplots()
stats.probplot(x, dist="norm", plot=ax)
plt.title("QQ Plot of MEDV")
plt.show()

# Log transform
log_x = np.log(x)
stat, p = stats.shapiro(log_x[:50])  # Shapiro-Wilk (n<50)
print(f"Shapiro-Wilk p-value (log-transformed): {p:.4f}")
\`\`\``
      }
    ]
  },

  "Probability Theory & Axioms": {
    description: "Kolmogorov's axioms form the mathematical bedrock of all probabilistic reasoning, machine learning, and statistical inference.",
    sections: [
      {
        heading: "Kolmogorov's Three Axioms",
        text: `A **probability space** is a triple (Ω, F, P) where:
• Ω is the **sample space** (all possible outcomes)
• F is the **sigma-algebra** (collection of events we can assign probabilities to)
• P is the **probability measure**

**Axiom 1 (Non-negativity)**: P(A) ≥ 0 for all events A
**Axiom 2 (Normalization)**: P(Ω) = 1
**Axiom 3 (Countable Additivity)**: For mutually exclusive events A₁, A₂,... : P(∪Aᵢ) = ΣP(Aᵢ)

From these three axioms, ALL of probability theory is derived. Complement rule P(Aᶜ) = 1 - P(A). Inclusion-exclusion: P(A∪B) = P(A) + P(B) - P(A∩B).`
      },
      {
        heading: "Conditional Probability & Independence",
        text: `**Conditional probability**: P(A|B) = P(A∩B) / P(B), provided P(B) > 0.

This is NOT just filtering. P(A|B) completely updates your belief about A given new information B.

**Independence**: A⊥B iff P(A∩B) = P(A)·P(B), equivalently P(A|B) = P(A). Independence means knowing B gives you NO information about A.

**Pairwise independence ≠ mutual independence**. Classic example: X, Y ~ Bernoulli(1/2) independent, Z = X XOR Y. X,Y,Z are pairwise independent but NOT mutually independent.

**Conditional independence**: A⊥B|C means P(A∩B|C) = P(A|C)·P(B|C). Crucial for Naive Bayes and graphical models.`
      },
      {
        heading: "Law of Total Probability & Bayes' Theorem",
        text: `**Law of Total Probability**: If B₁,...,Bₙ partition Ω:
P(A) = Σᵢ P(A|Bᵢ)·P(Bᵢ)

**Bayes' Theorem**: 
P(H|E) = P(E|H)·P(H) / P(E)

Where:
• P(H) = **prior** probability of hypothesis before seeing evidence
• P(E|H) = **likelihood** of evidence given hypothesis
• P(E) = **marginal likelihood** (normalizing constant)
• P(H|E) = **posterior** probability after seeing evidence

**Medical test example**: Disease prevalence P(D)=0.001. Test sensitivity P(T+|D)=0.99. Specificity P(T-|D̄)=0.99.
P(D|T+) = P(T+|D)·P(D) / [P(T+|D)·P(D) + P(T+|D̄)·P(D̄)]
= 0.99×0.001 / (0.99×0.001 + 0.01×0.999) = 0.0909 ≈ 9%

Only 9% chance of disease given a positive test when disease is rare! This is why mass screening without high prevalence is problematic. Base rate neglect is one of the most dangerous statistical errors in medicine.`
      },
      {
        heading: "Combinatorics & Counting",
        text: `**Multiplication rule**: n₁ choices for step 1, n₂ for step 2 → n₁·n₂ total outcomes.

**Permutations (ordered)**: P(n,k) = n!/(n-k)! — arrange k items from n distinct items.

**Combinations (unordered)**: C(n,k) = n!/(k!(n-k)!) — choose k items from n, order doesn't matter.

**Stars & Bars**: Number of ways to put k identical balls into n distinct bins = C(n+k-1, k). Used to count integer partitions.

**Birthday Paradox**: With 23 people, P(shared birthday) > 50%. P(all unique) = 365/365 × 364/365 × ... × 343/365. With 70 people, P > 99.9%. Lesson: coincidences are far more likely than intuition suggests.`
      }
    ]
  },

  "Hypothesis Testing & p-values": {
    description: "The most misunderstood concept in statistics. Used in every clinical trial, A/B test, and scientific paper. Master this to think like a scientist.",
    sections: [
      {
        heading: "The Framework: Null vs Alternative Hypothesis",
        text: `**Null Hypothesis H₀**: The default assumption (no effect, no difference). We never "prove" H₀, we either reject it or fail to reject it.

**Alternative Hypothesis H₁**: What we're trying to demonstrate. Can be one-sided (H₁: μ > μ₀) or two-sided (H₁: μ ≠ μ₀).

**Logic**: Assume H₀ is true. Compute how surprising our data is under H₀. If very surprising (p < α), reject H₀.

**Type I Error (α)**: Rejecting H₀ when it's actually true (false positive). Typically α = 0.05.
**Type II Error (β)**: Failing to reject H₀ when H₁ is true (false negative). Power = 1-β.

**The p-value**: P(observing data at least this extreme | H₀ is true). NOT the probability H₀ is true. NOT the probability the result is due to chance. This is the most common misinterpretation in all of science.`
      },
      {
        heading: "Common Tests & When to Use Them",
        text: `**One-sample z-test**: Known σ, test if μ = μ₀. Test stat: z = (x̄ - μ₀)/(σ/√n)

**One-sample t-test**: Unknown σ. Test stat: t = (x̄ - μ₀)/(s/√n) ~ t(n-1 df)

**Two-sample t-test**: Compare means of two groups. Welch's version (unequal variances) is almost always preferred.

**Paired t-test**: Before/after on same subjects. More powerful than two-sample.

**Chi-squared test**: Independence of categorical variables in a contingency table.

**Mann-Whitney U**: Non-parametric alternative to t-test. Uses ranks. Robust when normality assumption fails.

**ANOVA (F-test)**: Compare means of 3+ groups simultaneously. Avoids multiple comparisons inflation. If significant, use Tukey HSD post-hoc test.`
      },
      {
        heading: "The Multiple Testing Problem",
        text: `If you run 20 independent tests at α=0.05, expected false positives = 20×0.05 = 1. With 1000 tests (common in genomics), you'll get ~50 false positives.

**Bonferroni correction**: Divide α by number of tests. α_corrected = 0.05/1000 = 0.00005. Conservative — reduces power.

**Benjamini-Hochberg FDR control**: Controls the expected proportion of false discoveries. Sort p-values p₁ ≤ p₂ ≤ ... ≤ pₘ. Reject all pᵢ ≤ (i/m)·q. Much more powerful than Bonferroni for large-scale testing (genomics, fMRI).

**p-hacking**: Running tests until p < 0.05. Inflates false positive rate. Pre-registration of hypotheses solves this. The replication crisis in psychology/medicine is largely caused by p-hacking.`
      },
      {
        heading: "Statistical Power & Sample Size",
        text: `Power = P(reject H₀ | H₁ is true) = 1 - β. Typically want power ≥ 0.80.

Power increases with: larger sample size n, larger effect size δ, larger α, smaller variance σ².

**Cohen's d** (effect size for means): d = (μ₁ - μ₂)/σ_pooled. Small=0.2, Medium=0.5, Large=0.8.

**Sample size formula (two-sample t-test)**:
n = 2(z_α/2 + z_β)² σ² / δ²

For α=0.05, power=0.80, d=0.5: need n≈64 per group.

**Practical significance vs statistical significance**: With n=1,000,000, a 0.001-point difference is statistically significant but meaningless. Always report effect sizes, not just p-values.`
      }
    ]
  },

  "Transformer Architecture Deep Dive": {
    description: "The architecture that changed everything. From BERT to GPT to vision transformers — understanding attention from first principles.",
    sections: [
      {
        heading: "The Problem with RNNs",
        text: `Before transformers, sequence modeling relied on RNNs and LSTMs. Critical limitations:

**Sequential computation**: Must process tokens one-by-one. Cannot parallelize over sequence length. Training on long sequences (1000+ tokens) was painfully slow.

**Vanishing gradients**: Even LSTMs struggle with long-range dependencies over 500+ tokens. The gradient signal weakens as it backpropagates through many timesteps.

**Fixed-size context vector**: Encoder-decoder RNNs compressed entire input sequences into a single vector — clearly insufficient for long documents.

Bahdanau attention (2014) addressed the third problem but not the first two. The key insight of "Attention Is All You Need" (Vaswani et al., 2017): **What if we remove the recurrence entirely and use only attention?**`
      },
      {
        heading: "Scaled Dot-Product Attention",
        text: `The atomic unit of the transformer. Given queries Q, keys K, and values V:

**Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V**

Intuition: Q is "what I'm looking for", K is "what I have to offer", V is "the actual content".

The dot product QKᵀ computes compatibility between every query and every key — resulting in an n×n attention matrix for a sequence of n tokens. This is why transformer complexity is O(n²) — every token attends to every other token.

**Why divide by √dₖ?** With large dₖ, dot products grow large in magnitude, pushing softmax into regions of near-zero gradient (saturation). Dividing by √dₖ keeps gradients healthy. This was a critical empirical finding.

**Masking**: For autoregressive generation (GPT-style), apply a causal mask — token i cannot attend to tokens j > i. This preserves the autoregressive property during training.`
      },
      {
        heading: "Multi-Head Attention",
        text: `A single attention head can only learn one type of relationship. Multi-head attention runs h attention heads in parallel, each with different learned projections:

MultiHead(Q,K,V) = Concat(head₁,...,headₕ)·W^O

where headᵢ = Attention(QWᵢ^Q, KWᵢ^K, VWᵢ^V)

**Why multiple heads?** Different heads learn different relationship types:
• Head 1 might learn syntactic subject-verb agreement
• Head 2 might learn coreference resolution
• Head 3 might learn positional proximity

GPT-3 uses 96 heads with dₖ=128. Each head looks at 128-dimensional subspaces of the 12288-dimensional embeddings.

**Computational cost**: With h heads each of dimension dₖ = d_model/h, total cost is same as single-head attention at full dimension — but expressiveness is dramatically higher.`
      },
      {
        heading: "Positional Encoding & Feed-Forward Layers",
        text: `**Positional Encoding**: Attention is permutation-invariant — "the cat sat" and "sat the cat" have identical attention outputs without position info. Solution: add position embeddings to token embeddings.

Original paper used sinusoidal encoding:
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

Modern models (GPT, BERT) use learned positional embeddings. **RoPE** (Rotary Position Embedding) used in LLaMA: encodes position via rotation in complex plane — enables extrapolation to longer sequences than training length.

**Feed-Forward Network (FFN)**: After attention, each position independently passes through a 2-layer MLP with ReLU (or GELU in BERT/GPT):
FFN(x) = max(0, xW₁ + b₁)W₂ + b₂

FFN dimension is typically 4× model dimension. Hypothesis: FFN layers act as "memory" that stores factual knowledge, while attention layers route information.`
      },
      {
        heading: "BERT vs GPT Architecture",
        text: `**BERT (Bidirectional Encoder)**: Encoder-only. Reads entire sequence in both directions simultaneously. Pre-trained with Masked Language Modeling (15% tokens masked, predict them) and Next Sentence Prediction. Best for classification, NER, QA (non-generative tasks). Cannot generate text.

**GPT (Decoder-only)**: Causal self-attention — each token only sees past tokens. Pre-trained with next-token prediction (language modeling). Scales incredibly well (GPT-2→GPT-3→GPT-4). Best for text generation, few-shot learning.

**T5 (Encoder-Decoder)**: Full seq2seq. Both encoder and decoder. Pre-trained with span corruption (mask spans, predict). Best for translation, summarization, question answering as generation.

**Scaling laws (Chinchilla)**: Optimal model training: for compute budget C, optimal N (params) ∝ C^0.5, optimal D (tokens) ∝ C^0.5. LLaMA-2 followed this — train smaller models on more data. GPT-3 was undertrained relative to compute.`
      }
    ]
  },

  "Backpropagation & Chain Rule": {
    description: "The algorithm that made deep learning possible. Understanding backprop from calculus first principles is essential for debugging and designing neural networks.",
    sections: [
      {
        heading: "The Computational Graph",
        text: `A neural network is a function composition. For a 3-layer network:
ŷ = f₃(f₂(f₁(x)))

We can represent this as a directed acyclic graph (DAG) where each node is an operation and edges carry tensors.

**Forward pass**: Compute output ŷ from input x.
**Backward pass**: Compute ∂L/∂w for every parameter w using the chain rule.

PyTorch's autograd builds this graph dynamically. Each tensor operation creates a node in the graph storing a reference to its backward function.`
      },
      {
        heading: "Chain Rule in Multiple Dimensions",
        text: `For scalar-valued loss L and vector parameter w, we want ∇_w L.

**Univariate chain rule**: dL/dx = (dL/dy)(dy/dx)

**Multivariate**: If y = f(x₁,...,xₙ) and each xᵢ = gᵢ(t):
dL/dt = Σᵢ (∂L/∂xᵢ)(∂xᵢ/∂t)

**Matrix calculus for a linear layer** y = Wx + b:
• ∂L/∂W = δ·xᵀ where δ = ∂L/∂y (upstream gradient)
• ∂L/∂x = Wᵀ·δ (gradient flows back through transpose of weight matrix)
• ∂L/∂b = δ

This is why weight matrices appear transposed in backprop — a fundamental result with deep geometric intuition.`
      },
      {
        heading: "Backprop Through Common Operations",
        text: `**ReLU**: f(x) = max(0,x). f'(x) = 1 if x>0, else 0. Gradient is masked — only flows through active neurons. Dead neurons (always x<0) receive zero gradient and never recover.

**Sigmoid**: σ(x) = 1/(1+e^(-x)). σ'(x) = σ(x)(1-σ(x)). Maximum gradient = 0.25 at x=0. For deep networks, gradient shrinks geometrically → vanishing gradients.

**Softmax + Cross-Entropy (numerically stable combo)**:
∂L/∂zᵢ = pᵢ - yᵢ where p=softmax(z), y=one-hot target.
This beautiful result: gradient is simply the difference between predicted and true probabilities.

**BatchNorm backprop**: Non-trivial because the mean and variance depend on the entire mini-batch. The gradient must account for the dependency — see Ioffe & Szegedy (2015) for the full derivation.`
      },
      {
        heading: "Gradient Vanishing & Exploding",
        text: `In a network with L layers and activation derivatives d₁,...,d_L:
∂L/∂w₁ = (∂L/∂y_L) · d_L · W_L · d_{L-1} · W_{L-1} · ... · d₁

If |dᵢ·Wᵢ| < 1 for most layers → **vanishing gradients** (early layers learn nothing)
If |dᵢ·Wᵢ| > 1 for most layers → **exploding gradients** (NaN values, training diverges)

**Solutions**:
• **Residual connections** (ResNet): add skip connections y = F(x)+x. Gradient highway — allows gradient to flow directly to early layers.
• **Careful initialization**: Xavier (for tanh), He (for ReLU) — set initial variance to prevent explosion/vanishing at initialization.
• **Gradient clipping**: if ‖g‖ > threshold, g ← g·threshold/‖g‖. Standard in RNN/transformer training.
• **Layer Normalization**: normalize activations within a layer — keeps distributions stable.`
      }
    ]
  },

  // ─────────────────────────────────────────────
  // FULL STACK
  // ─────────────────────────────────────────────

  "JavaScript ES2024 — Core Language Deep Dive": {
    description: "JavaScript's execution model, type system, and modern features — the concepts that separate senior engineers from juniors.",
    sections: [
      {
        heading: "The Event Loop & JavaScript's Concurrency Model",
        text: `JavaScript is **single-threaded** — one call stack, one thing at a time. But it handles concurrency through an event-driven, non-blocking model.

**The Stack**: Synchronous code executes here. Function calls push frames, returns pop them.

**The Heap**: Unstructured memory region where objects are allocated.

**The Queue (Task Queue / Macrotask Queue)**: Holds callbacks from setTimeout, setInterval, I/O events. Processed one at a time after the stack is empty.

**The Microtask Queue**: Higher priority than task queue. Holds Promise callbacks (.then, .catch), queueMicrotask, MutationObserver. **Entire microtask queue is drained before the next macrotask.**

\`\`\`javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
\`\`\`

This order — 1, 4, 3, 2 — is guaranteed by the spec. Understanding why requires understanding the event loop phases.`
      },
      {
        heading: "Closures, Scope & the Scope Chain",
        text: `A **closure** is a function that retains access to its lexical scope even when executing outside that scope.

\`\`\`javascript
function makeCounter() {
  let count = 0;  // enclosed variable
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    get() { return count; }
  };
}
const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
// count is private — not accessible from outside
\`\`\`

**Scope chain**: When resolving a variable, JS walks up the chain of lexical environments until found. var is function-scoped. let/const are block-scoped.

**Classic interview problem**:
\`\`\`javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // prints 3,3,3
}
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // prints 0,1,2
}
\`\`\`
let creates a new binding per iteration. var shares one binding across all iterations.`
      },
      {
        heading: "Prototypes, Classes & Inheritance",
        text: `Every JavaScript object has an internal [[Prototype]] link. Property lookup walks this chain.

\`\`\`javascript
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() {
  return \`\${this.name} makes a noise.\`;
};

function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() {
  return \`\${this.name} barks.\`;
};
\`\`\`

ES6 class syntax is **syntactic sugar** over the same prototype chain:
\`\`\`javascript
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a noise.\`; }
}
class Dog extends Animal {
  speak() { return \`\${this.name} barks.\`; }
}
\`\`\`

**Private fields** (ES2022): Use # prefix. True privacy — not just convention.
\`\`\`javascript
class BankAccount {
  #balance = 0;
  deposit(amount) { this.#balance += amount; }
  get balance() { return this.#balance; }
}
\`\`\``
      },
      {
        heading: "Modern Async Patterns",
        text: `**Promises**: Represent eventual completion or failure. Three states: pending, fulfilled, rejected. Thenable chaining returns new promises.

**async/await**: Syntactic sugar over promises. Makes async code look synchronous.

\`\`\`javascript
// Parallel requests — correct
const [user, posts] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
]);

// Sequential (slower) — incorrect pattern
const user = await fetch('/api/user').then(r => r.json());
const posts = await fetch('/api/posts').then(r => r.json());
\`\`\`

**Promise.allSettled**: Wait for all, even if some reject. Useful for parallel operations where partial failure is acceptable.

**Promise.race**: First settled wins. Useful for timeouts:
\`\`\`javascript
const timeout = ms => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), ms));
const result = await Promise.race([fetchData(), timeout(5000)]);
\`\`\``
      }
    ]
  },

  "React Architecture & Virtual DOM": {
    description: "Understanding React's rendering model from first principles enables you to write performant applications and debug effectively.",
    sections: [
      {
        heading: "The Virtual DOM & Reconciliation",
        text: `The **Virtual DOM (VDOM)** is React's in-memory representation of the UI — a lightweight JavaScript tree of plain objects. Direct DOM manipulation is expensive because it triggers reflow and repaint. React batches changes by first updating the VDOM, then applying minimal changes to the real DOM.

**Reconciliation algorithm (React Fiber)**:
1. **Render phase**: Build a new VDOM tree (fiber tree). Diffing is O(n) with two heuristics: (a) Elements of different types produce different trees. (b) Keys hint at identity across renders.
2. **Commit phase**: Apply the minimal diff to the real DOM.

**The two diffing heuristics**:
• If root elements have different types (div→span), tear down old tree and build new one from scratch.
• For lists, use **keys** to identify which items moved, added, or removed. Without keys, React uses index — causing bugs when list order changes.

**React Fiber** (React 16+): Fiber is a unit of work. The fiber tree enables incremental rendering — React can pause, abort, or reuse work. This is what enables Concurrent Mode features like Suspense and useTransition.`
      },
      {
        heading: "Component Rendering & Optimization",
        text: `A component re-renders when: (1) its state changes, (2) its parent re-renders, (3) its context changes.

**React.memo**: Wraps a component to skip re-rendering if props haven't changed (shallow comparison).

\`\`\`jsx
const ExpensiveList = React.memo(({ items }) => {
  return items.map(item => <Item key={item.id} data={item} />);
});
\`\`\`

**useMemo**: Memoize expensive computed values.
\`\`\`jsx
const sortedItems = useMemo(() =>
  [...items].sort((a, b) => a.price - b.price),
  [items]  // only recompute when items changes
);
\`\`\`

**useCallback**: Memoize functions (for referential stability):
\`\`\`jsx
const handleClick = useCallback((id) => {
  dispatch({ type: 'SELECT', id });
}, [dispatch]);  // stable reference unless dispatch changes
\`\`\`

**Critical rule**: Premature optimization is harmful. Profile first with React DevTools Profiler. Most apps don't need memo/useMemo/useCallback — the overhead can sometimes exceed the savings.`
      },
      {
        heading: "React 18/19 Concurrent Features",
        text: `**Automatic Batching**: In React 18, state updates inside async functions, timeouts, and event handlers are all batched. Previously, only event handlers were batched.

**useTransition**: Mark state updates as non-urgent. UI stays responsive while "transition" re-renders happen in background.
\`\`\`jsx
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setSearchQuery(input);  // non-urgent update
});
// Can show loading indicator while pending
\`\`\`

**Suspense for Data Fetching**: Suspend rendering while data loads, show fallback.
\`\`\`jsx
<Suspense fallback={<Spinner />}>
  <UserProfile />  {/* throws promise if data not ready */}
</Suspense>
\`\`\`

**React 19 Server Components**: Components that render on the server only. Can access databases directly, no client-side JS. Mixed in same component tree as client components. Fundamental shift in architecture.`
      }
    ]
  },

  "Next.js App Router & File System Routing": {
    description: "Next.js 14+ App Router is a paradigm shift. Understanding the server/client boundary, data fetching, and caching model is critical for production apps.",
    sections: [
      {
        heading: "App Router File System Conventions",
        text: `Next.js App Router maps the filesystem to routes:
\`\`\`
app/
  layout.tsx          → Root layout (persistent, wraps all pages)
  page.tsx            → Home route /
  loading.tsx         → Suspense boundary for this route
  error.tsx           → Error boundary
  not-found.tsx       → 404 for this segment
  dashboard/
    layout.tsx        → Dashboard layout (nested)
    page.tsx          → /dashboard
    settings/
      page.tsx        → /dashboard/settings
  blog/
    [slug]/
      page.tsx        → /blog/my-post (dynamic segment)
  api/
    users/
      route.ts        → /api/users (Route Handler)
\`\`\`

**Special files**: layout (persistent wrapper), page (route UI), loading (Suspense fallback), error (error boundary), not-found, route (API handler), template (like layout but remounts).`
      },
      {
        heading: "Server vs Client Components",
        text: `**Server Components (default)**: Run only on the server. Can: access DB directly, use secrets, reduce client JS bundle. Cannot: use hooks, browser APIs, event listeners.

**Client Components** (add 'use client'): Run on server (initial HTML) AND client (hydration + interactions). Can: use hooks, event listeners, browser APIs.

**Decision tree**:
• Need onClick, onChange, useState, useEffect → Client Component
• Access DB, environment secrets, large dependencies → Server Component
• Need both → Keep logic in Server, pass data as props to Client

\`\`\`tsx
// Server Component — runs on server only
async function UserList() {
  const users = await db.users.findMany();  // direct DB access!
  return users.map(u => <UserCard key={u.id} user={u} />);
}

// Client Component — interactive
'use client';
function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? '❤️' : '🤍'}</button>;
}
\`\`\``
      },
      {
        heading: "Data Fetching & Caching Model",
        text: `Next.js extends the native fetch API with caching semantics:

\`\`\`tsx
// Cached indefinitely (Static — like SSG)
const data = await fetch('/api/products', { cache: 'force-cache' });

// Never cached (Dynamic — like SSR)
const data = await fetch('/api/user', { cache: 'no-store' });

// Revalidate every 60 seconds (like ISR)
const data = await fetch('/api/posts', { next: { revalidate: 60 } });
\`\`\`

**Full Route Cache**: Entire page output cached at build time. **Data Cache**: Individual fetch results cached across requests. **Router Cache**: Client-side cache of visited routes.

**Server Actions**: Async functions that run on the server, called from client forms or event handlers. Replace API routes for mutations.
\`\`\`tsx
// app/actions.ts
'use server';
export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ data: { title } });
  revalidatePath('/posts');
}

// app/new-post/page.tsx
<form action={createPost}>
  <input name="title" />
  <button type="submit">Create</button>
</form>
\`\`\``
      }
    ]
  },

  "Expo SDK & EAS Build System": {
    description: "Expo transforms React Native development. EAS Build enables professional-grade iOS and Android deployment without owning a Mac.",
    sections: [
      {
        heading: "Expo Architecture",
        text: `**Expo Go**: Development client app. Install on your phone, scan QR code, instantly run your app. Includes common native modules (camera, location, etc.). Limitation: cannot include custom native modules.

**Expo Dev Client**: Custom development build with your native modules. Replace Expo Go for production-grade development.

**Expo Managed Workflow**: Expo handles native code. Never touch Android Studio or Xcode. Use when: all needed functionality is available via Expo SDK.

**Expo Bare Workflow**: Access to native iOS/Android code. Eject from managed when you need custom native modules.

**Key Expo packages**:
• expo-router — file-system based navigation
• expo-camera — camera access
• expo-location — GPS
• expo-notifications — push notifications
• expo-image-picker — photo library
• expo-secure-store — keychain/keystore storage
• expo-av — audio/video playback`
      },
      {
        heading: "Expo Router — File-Based Navigation",
        text: `Expo Router brings Next.js-style file-system routing to React Native:

\`\`\`
app/
  _layout.tsx         → Root layout (tab/stack navigator)
  index.tsx           → Home tab
  (tabs)/
    _layout.tsx       → Tab bar configuration
    home.tsx          → /home
    profile.tsx       → /profile
  (auth)/
    login.tsx         → /login (outside tab bar)
  product/
    [id].tsx          → /product/123 (dynamic route)
\`\`\`

\`\`\`tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ... }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

// Navigate programmatically
import { router } from 'expo-router';
router.push('/product/123');
router.replace('/(auth)/login');
router.back();
\`\`\``
      },
      {
        heading: "EAS Build & Deployment",
        text: `**EAS Build**: Cloud build service. Build iOS .ipa and Android .apk/.aab in the cloud. No Mac needed for iOS builds.

\`\`\`bash
npm install -g eas-cli
eas login
eas build:configure   # creates eas.json

# Build for testing (TestFlight / Internal Testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Build for production
eas build --platform all --profile production

# Submit to App Store / Google Play
eas submit --platform ios
eas submit --platform android
\`\`\`

**eas.json configuration**:
\`\`\`json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
\`\`\`

**EAS Update (OTA)**: Push JavaScript updates without App Store review. Instant deployment for bug fixes. Only works for JS changes — native code still requires new build.`
      }
    ]
  },

  // ─────────────────────────────────────────────
  // ROBOTICS
  // ─────────────────────────────────────────────

  "Rotation Matrices, Euler Angles & Quaternions": {
    description: "Representing orientation in 3D space is fundamental to all robotics. Each representation has tradeoffs in singularities, computational efficiency, and interpolation.",
    sections: [
      {
        heading: "Rotation Matrices (SO(3))",
        text: `A rotation matrix R ∈ SO(3) satisfies: Rᵀ = R⁻¹ and det(R) = +1.

The Special Orthogonal group SO(3) has 3 degrees of freedom but rotation matrices have 9 elements with 6 constraints — redundant representation.

**Basic rotations**:
Rₓ(θ) = [[1,0,0],[0,cosθ,-sinθ],[0,sinθ,cosθ]]
Ry(θ) = [[cosθ,0,sinθ],[0,1,0],[-sinθ,0,cosθ]]
Rz(θ) = [[cosθ,-sinθ,0],[sinθ,cosθ,0],[0,0,1]]

**Composing rotations**: R = Rz·Ry·Rx (multiply right to left for intrinsic rotations, left to right for extrinsic).

**Physical interpretation**: Column i of R gives the coordinates of the i-th body frame axis expressed in the world frame. This is the key insight for FK/IK problems.`
      },
      {
        heading: "Euler Angles & Gimbal Lock",
        text: `Euler angles parameterize rotation using three sequential rotations about axes. Many conventions: ZYX (aerospace yaw-pitch-roll), ZXZ (classical mechanics), XYZ.

**RPY (Roll-Pitch-Yaw)**: ZYX convention. Yaw ψ about Z, Pitch θ about Y, Roll φ about X.
R = Rz(ψ)·Ry(θ)·Rx(φ)

**Gimbal Lock**: When the middle rotation is ±90°, the first and third rotations become equivalent — losing one degree of freedom. For a ZYX system with θ=90°, yaw and roll both rotate about the same physical axis. This is not a physical problem, it's a representational singularity.

**Practical consequences**: Flight control systems, robot arms, and camera gimbals must handle gimbal lock. Aerospace uses multiple redundant sensors near singularities. Robotics software (ROS) typically uses quaternions internally and converts to Euler only for display.`
      },
      {
        heading: "Quaternions",
        text: `A quaternion q = w + xi + yj + zk where i²=j²=k²=ijk=-1. For representing rotations, we use **unit quaternions** |q|=1.

**Rotation by angle θ about unit axis n̂=(nx,ny,nz)**:
q = [cos(θ/2), nx·sin(θ/2), ny·sin(θ/2), nz·sin(θ/2)]

**Why half-angles?** The double cover: q and -q represent the same rotation. Full sphere S³ double-covers SO(3).

**Composing rotations**: q₁₂ = q₁ ⊗ q₂ (quaternion multiplication). No gimbal lock, compact (4 scalars), numerically stable.

**Rotating a vector**: p' = q ⊗ p ⊗ q* where p=(0,v) and q* is conjugate.

**Quaternion → Rotation Matrix**:
\`\`\`
R = [[1-2(y²+z²),  2(xy-wz),    2(xz+wy)  ],
     [2(xy+wz),    1-2(x²+z²),  2(yz-wx)  ],
     [2(xz-wy),    2(yz+wx),    1-2(x²+y²) ]]
\`\`\`

**SLERP** (Spherical Linear Interpolation): Smooth interpolation between orientations:
q(t) = q₁ · (q₁⁻¹·q₂)^t for t∈[0,1]
Essential for smooth robot motion and animation.`
      },
      {
        heading: "Homogeneous Coordinates & SE(3)",
        text: `To combine rotation AND translation, use 4×4 **homogeneous transformation matrices** (elements of SE(3)):

T = [[R, t],[0, 1]] where R∈SO(3) (3×3 rotation), t∈ℝ³ (translation)

**Transforming a point**: p_world = T · [p_body; 1]

**Composing transformations**: T₁₂ = T₀₁ · T₁₂ (chain rule for frames)

**Inverse**: T⁻¹ = [[Rᵀ, -Rᵀt],[0, 1]] — much cheaper than general matrix inverse.

**Adjoint representation**: For propagating velocities and forces through the kinematic chain, the Adjoint Ad_T maps twists (6D velocity) across frames.

In ROS 2, TF2 manages an entire tree of these transformations in real-time, allowing any frame to be looked up relative to any other frame at any timestamp.`
      }
    ]
  },

  "ROS 2 Architecture: Nodes, Topics, Services": {
    description: "ROS 2 is the operating system of modern robotics. Understanding its communication primitives and middleware enables you to build any robot system.",
    sections: [
      {
        heading: "ROS 2 vs ROS 1",
        text: `ROS 2 was a ground-up redesign addressing ROS 1's limitations:

**No single master**: ROS 1 required a rosmaster process — single point of failure. ROS 2 uses DDS (Data Distribution Service) — fully distributed, peer-to-peer discovery.

**Real-Time support**: DDS QoS policies allow deterministic communication. ROS 2 runs on RT-Linux for actual hard real-time robotics.

**Multi-platform**: ROS 2 officially supports Ubuntu, macOS, and Windows. ROS 1 was Linux-only.

**Security**: SROS2 provides DDS Security — authentication, encryption, access control. Critical for medical robots and autonomous vehicles.

**Python & C++ as first-class citizens**: Both fully supported with rclpy and rclcpp.`
      },
      {
        heading: "Nodes, Topics & Messages",
        text: `A **Node** is a process that participates in the ROS 2 graph. Best practice: one node per logical component (sensor driver, controller, planner).

**Topics**: Asynchronous publish/subscribe. Publisher sends messages; any number of subscribers receive them. Decoupled — neither knows about the other.

\`\`\`python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class TalkerNode(Node):
    def __init__(self):
        super().__init__('talker')
        self.pub = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(1.0, self.timer_cb)

    def timer_cb(self):
        msg = String()
        msg.data = f"Hello {self.get_clock().now()}"
        self.pub.publish(msg)

class ListenerNode(Node):
    def __init__(self):
        super().__init__('listener')
        self.sub = self.create_subscription(
            String, 'chatter', self.cb, 10)

    def cb(self, msg):
        self.get_logger().info(f"Received: {msg.data}")
\`\`\`

**QoS (Quality of Service)**: Controls durability (transient local = late joiners get last message), reliability (best-effort vs reliable), history depth. Critical for sensor data (best-effort, low latency) vs control commands (reliable).`
      },
      {
        heading: "Services & Actions",
        text: `**Services**: Synchronous request-response. Client sends request, waits for response. Use for: parameter queries, one-shot commands, configuration.

\`\`\`python
# Service Server
from example_interfaces.srv import AddTwoInts

class AddServer(Node):
    def __init__(self):
        super().__init__('add_server')
        self.srv = self.create_service(AddTwoInts, 'add', self.callback)

    def callback(self, request, response):
        response.sum = request.a + request.b
        return response
\`\`\`

**Actions**: For long-running tasks with feedback and cancellation. Three parts: Goal, Result, Feedback.

\`\`\`python
# Action: robot navigates to waypoint (takes time, can cancel)
# Goal: target pose
# Feedback: current position, distance remaining
# Result: success/failure
\`\`\`

Use actions for: navigation goals, robot arm movements, long computations. Never use services for anything that takes more than ~100ms — it blocks the client.

**Parameters**: Node configuration values. Can be changed at runtime via ros2 param set. Backed by YAML files for launch-time configuration.`
      },
      {
        heading: "Launch Files & Lifecycle Nodes",
        text: `**Launch files** (Python): Compose multiple nodes, set parameters, remap topics:

\`\`\`python
# robot_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='robot_bringup',
            executable='lidar_driver',
            name='lidar',
            parameters=[{'frame_id': 'laser_frame', 'port': '/dev/ttyUSB0'}],
            remappings=[('/scan', '/robot/scan')]
        ),
        Node(
            package='slam_toolbox',
            executable='sync_slam_toolbox_node',
            name='slam',
        ),
        Node(
            package='nav2_bringup',
            executable='navigation_launch.py',
        )
    ])
\`\`\`

**Lifecycle Nodes**: Managed nodes with state machine (unconfigured→inactive→active→finalized). Enables deterministic startup, clean shutdown, and runtime reconfiguration without killing processes. Used in production robots for safety-critical components.`
      }
    ]
  },

  "Reinforcement Learning for Robotics (PPO, SAC)": {
    description: "Modern deep RL has enabled robots to learn complex manipulation, locomotion, and navigation tasks directly from experience.",
    sections: [
      {
        heading: "RL Fundamentals for Robotics",
        text: `**MDP (Markov Decision Process)**: The framework for RL. Defined by (S, A, P, R, γ) where:
• S: State space (joint angles, velocities, sensor readings)
• A: Action space (joint torques, motor velocities)
• P(s'|s,a): Transition dynamics (often unknown — model-free RL)
• R(s,a,s'): Reward function (task specification)
• γ: Discount factor [0,1) — how much future rewards matter

**Policy π(a|s)**: Maps states to (distributions over) actions. Goal: find π* that maximizes expected cumulative reward: E[Σᵢ γᵢ r_i]

**The reward engineering problem**: The reward function IS the task specification. Poorly designed rewards lead to reward hacking. A robot rewarded for "velocity forward" may learn to fall over. Curriculum learning and reward shaping are critical skills.

**Key robotics challenge**: Sparse rewards (reach the goal: +1, else 0) are very hard to learn from. Requires exploration. Hindsight Experience Replay (HER) is a powerful solution — relabel failed trajectories as if a nearby state was the goal.`
      },
      {
        heading: "PPO — Proximal Policy Optimization",
        text: `PPO (Schulman et al. 2017) is the most widely used on-policy RL algorithm. Used for OpenAI Five (Dota 2), robot locomotion (OpenAI Gym environments), ChatGPT's RLHF.

**Core idea**: Policy gradient methods update π directly but suffer from large updates that destroy the policy. PPO clips the update:

L_CLIP(θ) = E[min(r_t(θ)Â_t, clip(r_t(θ), 1-ε, 1+ε)Â_t)]

where r_t(θ) = π_θ(a|s) / π_θ_old(a|s) (probability ratio)
and Â_t is the advantage estimate (how much better than expected this action was)

The clip prevents the new policy from straying too far from the old policy, maintaining stable training.

**PPO for locomotion** (e.g., quadruped walking):
• State: joint angles, velocities, IMU data, foot contact
• Action: target joint angles (position control)
• Reward: forward velocity − 0.1·torque² − 0.5·pitch² (penalize falling)
• Typically 4096 parallel environments, ~10^8 environment steps

**Isaac Gym / MuJoCo / IsaacSim**: GPU-accelerated simulation enables 4096+ parallel environments on one GPU, dramatically accelerating training.`
      },
      {
        heading: "SAC — Soft Actor-Critic",
        text: `SAC (Haarnoja et al. 2018) is the gold standard for continuous control. Off-policy (sample efficient), entropy-regularized (encourages exploration).

**Entropy maximization objective**:
J(π) = Σ E[r(s,a) + α·H(π(·|s))]

Adding entropy H(π) prevents premature convergence to deterministic policies. The temperature α controls exploration-exploitation tradeoff (can be auto-tuned).

**Architecture**:
• Actor network: outputs mean and std of Gaussian → sample action via reparameterization trick (differentiable sampling)
• Two critic networks (Q₁, Q₂): take (s,a) → value. Use minimum to reduce overestimation
• Replay buffer: 10^6 transitions for off-policy learning

SAC convergence is far more stable than PPO for manipulation tasks (robot arm grasping, dexterous hand manipulation) where precise continuous control is needed.

**Comparison**: PPO is more sample-efficient for locomotion on fast simulators. SAC is better for real robot fine-tuning due to sample efficiency (replay buffer reuse).`
      },
      {
        heading: "Sim-to-Real Transfer",
        text: `The core challenge: policies trained in simulation often fail on real robots due to the **reality gap** — differences in dynamics, appearance, sensor noise.

**Domain Randomization**: Randomize simulation parameters (friction, mass, motor noise, visual textures) during training. Forces the policy to be robust. OpenAI's rubik's cube hand used extreme domain randomization (friction 0.5-1.5×, motor lag, random gravity direction).

**System Identification**: Carefully measure physical parameters (link masses, motor constants, joint friction) to match simulation to reality.

**Adaptive Policies**: Include system identification as part of the policy. The policy takes recent trajectory data as additional input and adapts to the current system.

**Real-World Fine-Tuning**: Start with simulated pre-training, then fine-tune on real robot with safe exploration. SAC with limited real data (10-50 episodes) can close the gap for many manipulation tasks.

**Curriculum Learning**: Start with easy tasks (short distances, no obstacles), progressively increase difficulty. Automatically curriculum by teacher algorithms (POET, ALP-GMM).`
      }
    ]
  },

  "SLAM — Simultaneous Localization and Mapping": {
    description: "SLAM enables robots to explore unknown environments and return home — one of the hardest problems in mobile robotics, now largely solved by modern algorithms.",
    sections: [
      {
        heading: "The SLAM Problem",
        text: `Given: noisy sensor measurements z₁:t and control inputs u₁:t
Estimate: map m (location of landmarks/obstacles) AND robot pose x_t

**The chicken-and-egg problem**: You need a map to localize, but you need localization to build a map.

**Full SLAM**: Estimate entire trajectory x₁:t and map m simultaneously. Computationally expensive.
**Online SLAM**: Only estimate current pose x_t and map m (marginalize over past poses).

**Sensor modalities**:
• **2D LiDAR SLAM**: Scan matching with particle filters (GMapping) or graph optimization (Cartographer). Works in 2D environments (indoor navigation).
• **3D LiDAR SLAM**: LOAM, LIO-SAM, KISS-ICP. Outdoor and complex 3D environments.
• **Visual SLAM (VSLAM)**: Camera only. ORB-SLAM3, COLMAP. Cheaper sensors but more brittle.
• **Visual-Inertial SLAM**: Camera + IMU. VINS-Mono, OpenVINS. Best of both worlds — used in AR/VR and drones.`
      },
      {
        heading: "Extended Kalman Filter SLAM",
        text: `The earliest and most studied SLAM algorithm. State vector: [x_robot, y_robot, θ_robot, x_l1, y_l1, ..., x_lN, y_lN]

**Predict step** (using odometry model):
x̂_t = f(x_{t-1}, u_t)  → propagate state through motion model
P̂_t = F_t · P_{t-1} · F_t^T + Q_t  → covariance prediction (Jacobian of motion model)

**Update step** (using landmark observations):
K_t = P̂_t · H_t^T · (H_t · P̂_t · H_t^T + R_t)^{-1}  → Kalman gain
x_t = x̂_t + K_t · (z_t - h(x̂_t))  → state update
P_t = (I - K_t · H_t) · P̂_t  → covariance update

**EKF SLAM complexity**: O(N²) per step for N landmarks. Impractical for large maps. Motivates sparse methods.

**Data association**: Matching observed landmarks to map landmarks. Hungarian algorithm, nearest-neighbor, ML association. Incorrect association causes divergence — the hardest part of SLAM.`
      },
      {
        heading: "Graph-Based SLAM & Loop Closure",
        text: `Modern SLAM uses **pose graphs**: nodes are robot poses, edges are relative pose constraints from odometry and sensor matching.

**Front-end**: Process raw sensor data → relative pose constraints. Scan matching (ICP — Iterative Closest Point), visual feature matching.

**Back-end**: Optimize the pose graph — find poses that best satisfy all constraints. Nonlinear least squares: minimize Σ_ij e_ij^T Ω_ij e_ij where e_ij is the error between estimated and measured relative pose.

Solved with **g2o**, **GTSAM**, or **Ceres**. GTSAM uses factor graphs and variable elimination for efficient marginalization.

**Loop Closure**: When the robot returns to a previously visited location and recognizes it, a strong constraint is added to the graph. Dramatically reduces drift accumulation.

Loop closure detection uses **appearance-based place recognition**: DBoW3 (bag of visual words from ORB features), NetVLAD (CNN global descriptors), ScanContext (LiDAR-based).

**SLAM Toolbox** (ROS 2): Production-ready 2D SLAM with lifelong mapping, map merging, and localization-only mode. Default SLAM for most ROS 2 navigation stacks.`
      }
    ]
  },

  "Forward Kinematics & Denavit-Hartenberg": {
    description: "FK answers 'where is the end-effector given joint angles?' — the first question in robot arm control. DH convention is the universal language of serial manipulators.",
    sections: [
      {
        heading: "Serial Manipulator Structure",
        text: `A serial robot arm has n joints connecting n+1 links. Joint i connects link i-1 to link i.

**Joint types**:
• **Revolute (R)**: Rotation about an axis. q_i = θ (angle). Most common.
• **Prismatic (P)**: Translation along an axis. q_i = d (distance).

**Configuration space (C-space)**: The set of all valid joint configurations. For n-DOF robot: n-dimensional. FK maps from C-space to task space (SE(3) end-effector pose).

**Workspace**: The set of reachable end-effector positions. **Dexterous workspace**: Positions reachable in all orientations. Depends on link lengths and joint limits.`
      },
      {
        heading: "Denavit-Hartenberg Convention",
        text: `DH gives a systematic way to assign frames to links. Each joint transformation is described by 4 parameters:

• **a_i** (link length): Distance along x_i from z_{i-1} to z_i
• **α_i** (link twist): Angle about x_i from z_{i-1} to z_i
• **d_i** (link offset): Distance along z_{i-1} from x_{i-1} to x_i
• **θ_i** (joint angle): Angle about z_{i-1} from x_{i-1} to x_i

For a revolute joint, **θ_i is the variable**; others are constant.
For a prismatic joint, **d_i is the variable**; others are constant.

**Transformation matrix from frame i-1 to i**:
T_{i-1}^i = Rot(z, θ_i) · Trans(z, d_i) · Trans(x, a_i) · Rot(x, α_i)

= [[cθᵢ, -sθᵢcαᵢ,  sθᵢsαᵢ, aᵢcθᵢ],
   [sθᵢ,  cθᵢcαᵢ, -cθᵢsαᵢ, aᵢsθᵢ],
   [0,    sαᵢ,     cαᵢ,     dᵢ   ],
   [0,    0,       0,       1    ]]`
      },
      {
        heading: "FK for a 6-DOF Robot Arm",
        text: `For KUKA iiR7 / Universal Robots UR5 (6-DOF):

End-effector pose: T_0^6 = T_0^1(θ₁) · T_1^2(θ₂) · T_2^3(θ₃) · T_3^4(θ₄) · T_4^5(θ₅) · T_5^6(θ₆)

**Python implementation with NumPy**:
\`\`\`python
import numpy as np

def dh_transform(a, alpha, d, theta):
    ct, st = np.cos(theta), np.sin(theta)
    ca, sa = np.cos(alpha), np.sin(alpha)
    return np.array([
        [ct, -st*ca,  st*sa, a*ct],
        [st,  ct*ca, -ct*sa, a*st],
        [0,   sa,     ca,    d   ],
        [0,   0,      0,     1   ]
    ])

# UR5 DH parameters [a, alpha, d, theta_offset]
ur5_dh = [
    [0,     np.pi/2, 0.089159, 0],
    [-0.425,    0,       0,    0],
    [-0.39225,  0,       0,    0],
    [0,     np.pi/2,  0.10915, 0],
    [0,    -np.pi/2,  0.09465, 0],
    [0,          0,   0.0823, 0],
]

def forward_kinematics(joint_angles):
    T = np.eye(4)
    for i, (a, alpha, d, offset) in enumerate(ur5_dh):
        T = T @ dh_transform(a, alpha, d, joint_angles[i] + offset)
    return T  # 4x4 homogeneous transform of end-effector

joints = [0, -np.pi/2, 0, -np.pi/2, 0, 0]  # home position
T_ee = forward_kinematics(joints)
print("End-effector position:", T_ee[:3, 3])
\`\`\``
      }
    ]
  }
};

// Generate content for any topic — real content if available, structured placeholder if not
export const generateContent = (topic) => {
  if (contentDatabase[topic]) {
    return { title: topic, ...contentDatabase[topic] };
  }

  // Intelligent fallback based on subject domain detection
  const isData = ["regression", "classification", "neural", "gradient", "feature", "model",
    "training", "loss", "batch", "epoch", "learning rate", "attention", "embedding",
    "statistics", "probability", "distribution", "hypothesis", "bayesian", "numpy",
    "pandas", "pytorch", "scikit", "clustering", "dimensionality", "mlops", "rag",
    "vector", "langchain", "fine-tun"].some(kw => topic.toLowerCase().includes(kw));

  const isRobotics = ["robot", "kinematics", "dynamics", "control", "sensor", "slam",
    "ros", "planning", "navigation", "actuator", "joint", "trajectory", "perception",
    "lidar", "camera", "imu", "pid", "mpc", "lqr", "reinforcement"].some(kw => topic.toLowerCase().includes(kw));

  const domain = isRobotics ? "Robotics" : isData ? "Data Science & AI" : "Full Stack Development";

  return {
    title: topic,
    description: `A comprehensive, graduate-level treatment of ${topic} as taught in ${domain} programs at MIT, Stanford, and CMU.`,
    sections: [
      {
        heading: "Conceptual Foundation",
        text: `${topic} is a foundational concept in ${domain}. Before implementation, you must understand the mathematical and theoretical underpinnings that motivate the design choices made in this area. Start by reviewing the prerequisite topics and ensuring you can explain the core problem that ${topic} solves from first principles. Ask yourself: what breaks without this? What were the previous approaches and why were they insufficient?`
      },
      {
        heading: "Core Theory & Mathematics",
        text: `The rigorous treatment of ${topic} requires understanding the formal definitions, key theorems, and their proofs. This is not just memorization — the proofs reveal WHY things work and under what conditions they break down. The most common mistake practitioners make is applying techniques outside their assumptions domain. In this section, work through the mathematical derivation from scratch, validate your understanding by rederiving key results on paper without notes.`
      },
      {
        heading: "Algorithm & Implementation",
        text: `Implementing ${topic} from scratch is the gold standard for understanding. Use only NumPy (or basic Python) for your first implementation — no high-level libraries. Then compare with the production implementation. Understand what optimizations the production code makes (numerical stability, vectorization, hardware acceleration). Profile both implementations. Write unit tests for edge cases. This is how MIT 6.867 (Machine Learning) and Stanford CS229 structure their problem sets.`
      },
      {
        heading: "Common Pitfalls & Debugging",
        text: `Real practitioners spend 80% of their time debugging. For ${topic}, the most common failure modes are: (1) violated assumptions (check them explicitly), (2) numerical instability (log-space computations, gradient clipping), (3) incorrect hyperparameter ranges, (4) data leakage in preprocessing, (5) incorrect evaluation metrics for the task. Build a mental checklist. When something doesn't work, start with the simplest possible case and add complexity one component at a time.`
      },
      {
        heading: "Research Frontiers & Further Reading",
        text: `To reach expert level in ${topic}, read the original papers — not just blog posts. For this topic: start with the foundational 1-2 papers, then the most-cited modern papers (Google Scholar sorted by citations). Implement the experiments from at least one paper. Write your own summary explaining the contribution in one paragraph. This is the PhD-level mastery that separates people who use tools from people who build them. Recommended conferences: NeurIPS, ICML, ICLR (AI/ML), ICRA, RSS (Robotics), OSDI, SOSP (Systems).`
      }
    ]
  };
};
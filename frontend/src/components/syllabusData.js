const syllabusData = {
  mysql: {
    title: "MySQL",
    modules: {
      "Basics": [
        "Introduction to RDBMS",
        "SQL Syntax",
        "SELECT Statement",
        "WHERE Clause",
        "ORDER BY",
        "LIMIT"
      ],
      "Intermediate": [
        "JOINS (INNER, LEFT, RIGHT)",
        "GROUP BY & HAVING",
        "Subqueries",
        "Indexes",
        "Views",
        "Stored Procedures"
      ],
      "Advanced": [
        "Triggers",
        "Transactions",
        "Normalization",
        "Query Optimization",
        "Performance Tuning",
        "Replication & Scaling"
      ]
    }
  },

  python: {
    title: "Python",
    modules: {
      "Core Python": [
        "Variables & Data Types",
        "Loops",
        "Functions",
        "OOP Concepts",
        "Exception Handling"
      ],
      "Advanced Python": [
        "Decorators",
        "Generators",
        "Multithreading",
        "Async Programming",
        "Memory Management"
      ],
      "Backend Development": [
        "Django Basics",
        "Django REST Framework",
        "Authentication & JWT",
        "API Development",
        "Deployment"
      ]
    }
  },

  react: {
    title: "React",
    modules: {
      "Fundamentals": [
        "JSX",
        "Components",
        "Props & State",
        "Hooks (useState, useEffect)",
        "Routing"
      ],
      "Advanced React": [
        "Context API",
        "Redux Toolkit",
        "Performance Optimization",
        "Code Splitting",
        "Custom Hooks"
      ],
      "Production": [
        "Authentication",
        "Protected Routes",
        "API Integration",
        "Vite Optimization",
        "Deployment on Vercel"
      ]
    }
  },

  ml: {
    title: "Machine Learning",
    modules: {
      "Foundations": [
        "Linear Regression",
        "Logistic Regression",
        "KNN",
        "Decision Trees",
        "SVM"
      ],
      "Advanced ML": [
        "Random Forest",
        "Gradient Boosting",
        "XGBoost",
        "Feature Engineering",
        "Hyperparameter Tuning"
      ],
      "Production ML": [
        "Model Evaluation",
        "Model Deployment",
        "ML APIs in Django",
        "Clustering (KMeans)",
        "Real-world Projects"
      ]
    }
  },

  genai: {
    title: "Gen AI",
    modules: {
      "LLM Basics": [
        "Transformers",
        "Tokenization",
        "Embeddings",
        "Prompt Engineering"
      ],
      "Advanced LLM": [
        "Fine-Tuning",
        "RAG Architecture",
        "Vector Databases",
        "LangChain"
      ],
      "Production AI": [
        "Local LLM (llama.cpp)",
        "AI Chatbot with Django",
        "Voice AI Integration",
        "Scaling AI Systems"
      ]
    }
  }
};

export default syllabusData;
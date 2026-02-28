import pandas as pd
import os
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import NearestNeighbors
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from sklearn.preprocessing import StandardScaler
from rest_framework.permissions import AllowAny

# -------------------------
# Load Data
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(BASE_DIR, "youtube_data.csv")

data = pd.read_csv(file_path)

# Normalize column names
data.columns = data.columns.str.strip().str.lower().str.replace(" ", "_")

# Fix Channel Name Column
if "channel_name" not in data.columns:
    if "youtuber" in data.columns:
        data.rename(columns={"youtuber": "channel_name"}, inplace=True)
    elif "title" in data.columns:
        data.rename(columns={"title": "channel_name"}, inplace=True)

# Validate Required Columns
required_columns = ["channel_name", "subscribers", "video_views", "uploads"]
for col in required_columns:
    if col not in data.columns:
        raise ValueError(f"Missing column in CSV: {col}")

# -------------------------
# Models
# -------------------------
features = ["subscribers", "video_views", "uploads"]

# Model 1: Predict Subscribers
X_sub = data[["video_views", "uploads"]]
y_sub = data["subscribers"]
reg_sub_model = LinearRegression()
reg_sub_model.fit(X_sub, y_sub)

# Model 2: Predict Video Views
X_views = data[["subscribers", "uploads"]]
y_views = data["video_views"]
reg_views_model = LinearRegression()
reg_views_model.fit(X_views, y_views)

# KNN Model
scaler = StandardScaler()
scaled_features = scaler.fit_transform(data[features])
n_neighbors = min(5, len(data))
knn = NearestNeighbors(n_neighbors=n_neighbors)
knn.fit(scaled_features)

# -------------------------
# API - FIXED ORDER
# -------------------------
@api_view(["POST"])              # ← First (closest to function)
@permission_classes([AllowAny])  # ← Second
def recommend(request):
    try:
        subscribers = request.data.get("subscribers")
        views = request.data.get("views")
        uploads = request.data.get("uploads")

        if subscribers is None or views is None or uploads is None:
            return Response(
                {"error": "Missing required fields: subscribers, views, uploads"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscribers = float(subscribers)
        views = float(views)
        uploads = float(uploads)

        # Predictions
        predicted_subscribers = reg_sub_model.predict([[views, uploads]])[0]
        predicted_views = reg_views_model.predict([[subscribers, uploads]])[0]

        # Similar Channels
        input_data = [[subscribers, views, uploads]]
        input_scaled = scaler.transform(input_data)
        distances, indices = knn.kneighbors(input_scaled)

        similar = data.iloc[indices[0]][
            ["channel_name", "subscribers", "video_views", "uploads"]
        ].to_dict(orient="records")

        return Response({
            "predicted_subscribers": int(predicted_subscribers),
            "predicted_video_views": int(predicted_views),
            "similar_channels": similar
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
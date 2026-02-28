import { useState } from "react";
import axios from "axios";

// ── Reads from .env.local (local) or .env (production) ───────────────────────
const API_PREDICT = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/ml/recommend/`;

function MLPredictor() {
  const [form, setForm] = useState({
    subscribers: "", views: "", uploads: ""
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const formatNumber = (num) => num ? Number(num).toLocaleString() : 0;

  const handleSubmit = async () => {
    setError(null);
    if (!form.subscribers || !form.views || !form.uploads) {
      setError("Please fill all fields."); return;
    }
    try {
      setLoading(true);
      const res = await axios.post(API_PREDICT, {
        subscribers: Number(form.subscribers),
        views:       Number(form.views),
        uploads:     Number(form.uploads),
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🚀 YouTube Growth Predictor</h1>
        <p className="page-subtitle">AI-powered channel analytics and prediction engine</p>
      </div>

      <div className="predictor-grid">
        {/* Input Section */}
        <div className="predictor-card">
          <div className="card-header">
            <span className="card-icon">📊</span>
            <h3>Channel Metrics</h3>
          </div>

          <div className="form-group">
            <label>Current Subscribers</label>
            <input type="number" placeholder="e.g., 10000" value={form.subscribers}
              onChange={e => setForm({ ...form, subscribers: e.target.value })} className="input-field" />
          </div>

          <div className="form-group">
            <label>Total Video Views</label>
            <input type="number" placeholder="e.g., 500000" value={form.views}
              onChange={e => setForm({ ...form, views: e.target.value })} className="input-field" />
          </div>

          <div className="form-group">
            <label>Total Uploads</label>
            <input type="number" placeholder="e.g., 50" value={form.uploads}
              onChange={e => setForm({ ...form, uploads: e.target.value })} className="input-field" />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary predictor-btn">
            {loading ? (
              <><div className="loading-spinner-small" />Analyzing...</>
            ) : (
              <>🔮 Predict Growth</>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="results-section">
            <div className="prediction-cards">
              <div className="prediction-card subscribers">
                <div className="prediction-icon">📈</div>
                <div className="prediction-label">Predicted Subscribers</div>
                <div className="prediction-value">{formatNumber(result.predicted_subscribers)}</div>
                <div className="prediction-glow" />
              </div>
              <div className="prediction-card views">
                <div className="prediction-icon">📺</div>
                <div className="prediction-label">Predicted Video Views</div>
                <div className="prediction-value">{formatNumber(result.predicted_video_views)}</div>
                <div className="prediction-glow" />
              </div>
            </div>

            <div className="similar-channels">
              <h3 className="section-title"><span>🔥</span> Top Similar Channels</h3>
              <div className="channels-grid">
                {result.similar_channels?.map((channel, index) => (
                  <div key={index} className="channel-card">
                    <div className="channel-rank">#{index + 1}</div>
                    <h4 className="channel-name">{channel.channel_name}</h4>
                    <div className="channel-stats">
                      <div className="stat">
                        <span className="stat-label">Subscribers</span>
                        <span className="stat-value">{formatNumber(channel.subscribers)}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Views</span>
                        <span className="stat-value">{formatNumber(channel.video_views)}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Uploads</span>
                        <span className="stat-value">{formatNumber(channel.uploads)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MLPredictor;
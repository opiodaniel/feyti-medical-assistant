import React, { useState } from 'react';
import axios from 'axios';


// Use the VITE_DJANGO_API_URL environment variable for production
// Fallback to localhost for local development
const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

function App() {
  const [report, setReport] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translation, setTranslation] = useState('');
  const [history, setHistory] = useState([]);

  // --- Core Function: Process Report ---
  const handleProcessReport = async () => {
    if (!report) return;
    setLoading(true);
    setError(null);
    setProcessedData(null);
    setTranslation('');

    try {
      const response = await axios.post(`${API_BASE_URL}/process-report`, {
        report: report,
      });
      setProcessedData(response.data);
      // Automatically refresh history after processing
      fetchHistory();
    } catch (err) {
      setError("Failed to process report. Check backend server and API URL.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Bonus Function: Translate Outcome ---
  const handleTranslate = async (lang) => {
    if (!processedData?.outcome) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/translate`, {
        outcome: processedData.outcome,
        lang: lang,
      });
      setTranslation(response.data.translation);
    } catch (err) {
      alert("Translation failed.");
    }
  };

  // --- Bonus Function: Fetch History ---
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch report history.", err);
    }
  };

  // Fetch history on component mount
  React.useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1>🔬 Regulatory Report Assistant</h1>
      
      {/* 1. Input Form */}
      <h2>1. Submit Report</h2>
      <textarea
        rows="6"
        cols="50"
        value={report}
        onChange={(e) => setReport(e.target.value)}
        placeholder="Paste medical report here, e.g., Patient experienced severe nausea and headache after taking Drug X. Patient recovered."
        style={{ width: '100%', padding: '10px' }}
      />
      <button onClick={handleProcessReport} disabled={loading} style={{ padding: '10px 20px', marginTop: '10px' }}>
        {loading ? 'Processing...' : 'Process Report'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* 2. Display Results */}
      {processedData && (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px' }}>
          <h2>2. Processed Results</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Drug Name:</td>
                <td>{processedData.drug}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Adverse Events:</td>
                <td>{processedData.adverse_events.join(', ')}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Severity:</td>
                <td style={{ color: processedData.severity === 'severe' ? 'red' : 'green' }}>
                  {processedData.severity.toUpperCase()}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Outcome:</td>
                <td>{processedData.outcome}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Bonus 3a: Translate Outcome */}
          <div style={{ marginTop: '15px' }}>
            <button onClick={() => handleTranslate('fr')} style={{ marginRight: '10px' }}>
              Translate to French 🇫🇷
            </button>
            <button onClick={() => handleTranslate('sw')}>
              Translate to Swahili 🇹🇿
            </button>
            {translation && <p style={{ marginTop: '10px' }}>**Translation:** {translation}</p>}
          </div>
        </div>
      )}

      {/* Bonus 3b: History View */}
      <div style={{ marginTop: '40px' }}>
        <h2>History of Reports</h2>
        {history.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Drug</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Severity</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Outcome</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.drug}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.severity}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.outcome}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(item.processed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reports processed yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
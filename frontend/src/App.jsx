import React, { useState } from 'react';
import axios from 'axios';

// Use the VITE_DJANGO_API_URL environment variable for production
// Fallback to localhost for local development
const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

// --- Professional Style Object (Reverting to inline CSS) ---
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '30px auto',
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  header: {
    color: '#004080',
    borderBottom: '2px solid #004080',
    paddingBottom: '10px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#333',
    borderLeft: '4px solid #004080',
    paddingLeft: '10px',
    marginTop: '30px',
    marginBottom: '15px',
  },
  textArea: {
    width: '100%',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  primaryButton: {
    padding: '12px 25px',
    backgroundColor: '#004080',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginRight: '10px',
  },
  secondaryButton: {
    padding: '8px 15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  resultsCard: {
    marginTop: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 5px',
  },
  tableCell: {
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  historyHeader: {
    backgroundColor: '#e9ecef',
  }
};


function App() {
  const [report, setReport] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translation, setTranslation] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false); // New state for history loading

  // --- Core Function: Process Report ---
  const handleProcessReport = async () => {
    if (!report) {
      setError("Report field cannot be empty.");
      return;
    }
    setLoading(true);
    setError(null);
    setProcessedData(null);
    setTranslation('');

    try {
      const response = await axios.post(`${API_BASE_URL}/process-report`, {
        report: report,
      });
      setProcessedData(response.data);
      // Automatically refresh history after processing a new report
      fetchHistory(); 
    } catch (err) {
      setError("Failed to process report. Check backend server and API URL.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Core Function: Fetch History (Used by button and on mount) ---
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      // NOTE: Uses the requested /reports endpoint
      const response = await axios.get(`${API_BASE_URL}/reports`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch report history.", err);
    } finally {
      setHistoryLoading(false);
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

  // Fetch history on component mount
  React.useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={styles.container}>
      
      {/* Header & Report History Button */}
      <div style={styles.header}>
        <h1>🔬 Regulatory Report Assistant</h1>
        <button 
          onClick={fetchHistory} 
          disabled={historyLoading}
          style={{ 
            ...styles.primaryButton, 
            backgroundColor: historyLoading ? '#6c757d' : '#28a745' 
          }}
          title="Refresh the list of all past reports"
        >
          {historyLoading ? 'Loading...' : '🔄 Refresh Report History'}
        </button>
      </div>
      
      {/* 1. Input Form */}
      <h2 style={styles.sectionTitle}>1. Submit Report</h2>
      <textarea
        rows="6"
        cols="50"
        value={report}
        onChange={(e) => setReport(e.target.value)}
        placeholder="Paste medical report here, e.g., Patient experienced severe nausea and headache after taking Drug X. Patient recovered."
        style={styles.textArea}
      />
      <button 
        onClick={handleProcessReport} 
        disabled={loading} 
        style={{ ...styles.primaryButton, marginTop: '15px' }}
      >
        {loading ? 'Processing...' : 'Process Report'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>🚨 Error: {error}</p>}
      
      {/* 2. Display Results */}
      {processedData && (
        <div style={styles.resultsCard}>
          <h2 style={{ ...styles.sectionTitle, marginTop: '0', borderLeftColor: '#28a745' }}>✅ Processed Results</h2>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.tableCell, fontWeight: 'bold', width: '30%' }}>Drug Name:</td>
                <td style={styles.tableCell}>{processedData.drug}</td>
              </tr>
              <tr>
                <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>Adverse Events:</td>
                <td style={styles.tableCell}>{processedData.adverse_events.join(', ')}</td>
              </tr>
              <tr>
                <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>Severity:</td>
                <td style={styles.tableCell}>
                  <strong style={{ color: processedData.severity === 'severe' ? 'red' : 'green' }}>
                    {processedData.severity.toUpperCase()}
                  </strong>
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>Outcome:</td>
                <td style={styles.tableCell}>{processedData.outcome}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Bonus 3a: Translate Outcome */}
          <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Translate Outcome:</p>
            <button onClick={() => handleTranslate('fr')} style={styles.secondaryButton}>
              French 🇫🇷
            </button>
            <button onClick={() => handleTranslate('sw')} style={{ ...styles.secondaryButton, marginLeft: '10px' }}>
              Swahili 🇹🇿
            </button>
            {translation && <p style={{ marginTop: '15px', color: '#004080' }}>**Translation:** *{translation}*</p>}
          </div>
        </div>
      )}

      {/* History View */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={styles.sectionTitle}>History of Reports</h2>
        {historyLoading && <p style={{ padding: '10px', color: '#004080' }}>Loading report history...</p>}

        {!historyLoading && history.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
            <thead>
              <tr style={styles.historyHeader}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Drug</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Severity</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Outcome</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} style={{ backgroundColor: item.severity === 'severe' ? '#fff0f3' : 'white' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.drug}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: item.severity === 'severe' ? 'red' : 'green' }}>{item.severity.toUpperCase()}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.outcome}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(item.processed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !historyLoading && <p>No reports processed yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
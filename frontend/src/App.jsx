import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '40px',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#ffffff', 
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', 
  },
  header: {
    color: '#1a237e', 
    borderBottom: '3px solid #3f51b5', 
    paddingBottom: '15px',
    marginBottom: '40px',
    fontSize: '2em',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#333',
    borderLeft: '5px solid #3f51b5',
    paddingLeft: '15px',
    marginTop: '30px',
    marginBottom: '20px',
    fontSize: '1.5em',
    fontWeight: '600',
  },
  textArea: {
    width: '100%',
    padding: '18px',
    borderRadius: '10px',
    border: '2px solid #e0e0e0',
    fontSize: '16px',
    resize: 'vertical',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  primaryButton: {
    padding: '14px 30px',
    backgroundColor: '#3f51b5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '17px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
    fontWeight: '600',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#757575', 
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  resultsCard: {
    marginTop: '40px',
    border: '1px solid #f0f0f0',
    borderRadius: '12px',
    padding: '30px',
    backgroundColor: '#f9f9ff',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 10px', 
  },
  tableRow: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
  },
  tableCell: {
    padding: '15px',
    border: 'none',
  },
  historyHeader: {
    backgroundColor: '#e8eaf6', 
  },
  historyContainer: {
    marginTop: '40px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#fff',
  }
};


function App() {
  const [report, setReport] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translation, setTranslation] = useState('');
  
  // New State for History Visibility
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      // User must click to view.
    } catch (err) {
      setError("Failed to process report. Check backend server and API URL.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Core Function: Fetch History (Called when user clicks "View History") ---
  const fetchHistory = async () => {
    // If history is already shown, hide it. Otherwise, fetch and show.
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    
    setHistoryLoading(true);
    setShowHistory(true); // Prepare to show the loading state
    
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch report history.", err);
      // Keep showing the component but display error/empty state
      setHistory([]); 
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // --- Translate Outcome ---
  const handleTranslate = async (lang) => {
    if (!processedData?.outcome) return;
    
    // Clear previous translation before fetching new one
    setTranslation(`Translating to ${lang}...`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/translate`, {
        outcome: processedData.outcome,
        lang: lang,
      });
      setTranslation(response.data.translation);
    } catch (err) {
      setTranslation("Translation failed.");
      alert("Translation failed.");
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        🔬 Regulatory Report Assistant
      </div>
      
      {/* Input Form */}
      <h2 style={styles.sectionTitle}>1. Submit Report for Analysis</h2>
      <textarea
        rows="8"
        value={report}
        onChange={(e) => setReport(e.target.value)}
        placeholder="Paste medical report here, e.g., Patient experienced severe nausea and headache after taking Drug X. Patient recovered."
        style={styles.textArea}
      />
      <button 
        onClick={handleProcessReport} 
        disabled={loading} 
        style={{ ...styles.primaryButton, marginTop: '20px' }}
      >
        {loading ? 'Processing...' : 'Analyze Report'}
      </button>

      {error && <p style={{ color: '#d32f2f', marginTop: '15px', fontWeight: 'bold' }}>Error: {error}</p>}
      
      {/* Display Results */}
      {processedData && (
        <div style={styles.resultsCard}>
          <h2 style={{ ...styles.sectionTitle, marginTop: '0', borderLeftColor: '#4caf50' }}>
            Analysis Complete
          </h2>
          
          <table style={styles.table}>
            <tbody>
              {/* Drug Name */}
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, fontWeight: 'bold', width: '30%', color: '#3f51b5' }}>Drug Name:</td>
                <td style={styles.tableCell}>{processedData.drug}</td>
              </tr>
              {/* Adverse Events */}
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, fontWeight: 'bold', width: '30%', color: '#3f51b5' }}>Adverse Events:</td>
                <td style={styles.tableCell}>{processedData.adverse_events.join(', ')}</td>
              </tr>
              {/* Severity */}
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, fontWeight: 'bold', width: '30%', color: '#3f51b5' }}>Severity:</td>
                <td style={styles.tableCell}>
                  <strong style={{ color: processedData.severity === 'severe' ? '#e53935' : '#4caf50', textTransform: 'uppercase' }}>
                    {processedData.severity}
                  </strong>
                </td>
              </tr>
              {/* Outcome */}
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, fontWeight: 'bold', width: '30%', color: '#3f51b5' }}>Outcome:</td>
                <td style={styles.tableCell}>{processedData.outcome}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Translate Outcome */}
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '15px', color: '#1a237e' }}>Translate Outcome</p>
            <button 
              onClick={() => handleTranslate('fr')} 
              style={{...styles.secondaryButton, backgroundColor: '#1e88e5'}}
            >
              French
            </button>
            <button 
              onClick={() => handleTranslate('sw')} 
              style={{ ...styles.secondaryButton, marginLeft: '15px', backgroundColor: '#00bcd4' }}
            >
              Swahili
            </button>
            {translation && (
              <p style={{ marginTop: '20px', color: '#1a237e', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '8px', borderLeft: '5px solid #1e88e5' }}>
                **Translation:** *{translation}*
              </p>
            )}
          </div>
        </div>
      )}

      {/* History Toggle Button */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={fetchHistory} 
          disabled={historyLoading}
          style={{ 
            ...styles.primaryButton, 
            backgroundColor: showHistory ? '#d32f2f' : '#455a64' // Red if showing, Grey if hidden
          }}
          title={showHistory ? 'Hide the report history table' : 'Load and show the report history'}
        >
          {historyLoading 
            ? 'Loading History...' 
            : showHistory 
              ? '⬇️ Hide Report History' 
              : '⬆️ View Report History'}
        </button>
      </div>

      {/* History View (Conditional Display) */}
      {showHistory && (
        <div style={styles.historyContainer}>
          <h2 style={{ ...styles.sectionTitle, marginTop: '0' }}>Report History</h2>

          {historyLoading ? (
            <p style={{ padding: '10px', color: '#3f51b5', textAlign: 'center' }}>Loading report history...</p>
          ) : history.length > 0 ? (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #ccc' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={styles.historyHeader}>
                    <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5', textAlign: 'left', color: '#1a237e' }}>Drug</th>
                    <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5', textAlign: 'left', color: '#1a237e' }}>Severity</th>
                    <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5', textAlign: 'left', color: '#1a237e' }}>Outcome</th>
                    <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5', textAlign: 'left', color: '#1a237e' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#fcfcff' : 'white', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>{item.drug}</td>
                      <td style={{ padding: '15px', color: item.severity === 'severe' ? '#e53935' : '#4caf50', fontWeight: 'bold' }}>{item.severity.toUpperCase()}</td>
                      <td style={{ padding: '15px' }}>{item.outcome}</td>
                      <td style={{ padding: '15px' }}>{new Date(item.processed_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '20px', textAlign: 'center', color: '#757575', border: '1px dashed #ccc', borderRadius: '8px' }}>No reports found in history.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
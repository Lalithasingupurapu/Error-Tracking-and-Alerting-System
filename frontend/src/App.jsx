import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedError, setSelectedError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterApp, setFilterApp] = useState('All')
  const [filterSeverity, setFilterSeverity] = useState('All')

  useEffect(() => {
    fetchErrors()
    // Poll every 5 seconds for real-time feel
    const interval = setInterval(fetchErrors, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchErrors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/errors')
      const data = await response.json()
      setErrors(data)
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch errors:", err)
    }
  }

  const handleResolve = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/errors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      })
      // Optimistic update
      setErrors(errors.map(err => 
        err._id === id ? { ...err, status: 'resolved' } : err
      ))
    } catch (err) {
      console.error("Failed to resolve error:", err)
    }
  }

  const uniqueApps = ['All', ...new Set(errors.map(e => e.appName))];

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          error.appName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApp = filterApp === 'All' || error.appName === filterApp;
    const matchesSeverity = filterSeverity === 'All' || error.severity === filterSeverity;
    return matchesSearch && matchesApp && matchesSeverity;
  });

  const unresolvedCount = filteredErrors.filter(e => e.status !== 'resolved').length;
  const criticalCount = filteredErrors.filter(e => e.severity === 'critical' && e.status !== 'resolved').length;

  return (
    <div className="dashboard-container">
      <header>
        <h1>Error Tracking and Alerting System</h1>
        <div className="metrics">
          <div className="metric-card">
            <span>Unresolved</span>
            <strong style={{ color: unresolvedCount > 0 ? 'var(--accent-yellow)' : 'inherit' }}>{unresolvedCount}</strong>
          </div>
          <div className="metric-card">
            <span>Critical</span>
            <strong style={{ color: criticalCount > 0 ? 'var(--accent-red)' : 'inherit' }}>{criticalCount}</strong>
          </div>
        </div>
      </header>

      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search errors..." 
          className="filter-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={filterApp} onChange={(e) => setFilterApp(e.target.value)}>
          {uniqueApps.map(app => (
            <option key={app} value={app}>{app === 'All' ? 'All Apps' : app}</option>
          ))}
        </select>
        <select className="filter-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="All">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading system errors...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Severity</th>
                <th>App Name</th>
                <th>Error Message</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    🎉 No errors found matching your filters!
                  </td>
                </tr>
              ) : (
                filteredErrors.map((error) => (
                  <tr key={error._id} style={{ opacity: error.status === 'resolved' ? 0.5 : 1 }}>
                    <td>
                      <div className="status-indicator">
                        <div className={`dot ${error.status === 'resolved' ? 'resolved' : 'unresolved'}`}></div>
                        {error.status === 'resolved' ? 'Resolved' : 'Active'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${error.severity || 'medium'}`}>
                        {error.severity || 'medium'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {error.appName}
                      {error.occurrences > 1 && (
                        <span className="occurrence-badge" title={`${error.occurrences} Occurrences`}>
                          {error.occurrences}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="error-msg" title={error.message}>
                        {error.message}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(error.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn"
                          onClick={() => setSelectedError(error)}
                        >
                          View Details
                        </button>
                        <button 
                          className="resolve-btn"
                          onClick={() => handleResolve(error._id)}
                          disabled={error.status === 'resolved'}
                        >
                          {error.status === 'resolved' ? 'Done ✓' : 'Mark Resolved'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAILED ERROR MODAL */}
      {selectedError && (
        <div className="modal-overlay" onClick={() => setSelectedError(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Error Details</h2>
              <button className="close-btn" onClick={() => setSelectedError(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-meta">
                <p><strong>App:</strong> {selectedError.appName}</p>
                <p>
                  <strong>Severity:</strong> 
                  <span className={`badge ${selectedError.severity || 'medium'}`} style={{ marginLeft: '8px' }}>
                    {selectedError.severity || 'medium'}
                  </span>
                </p>
                <p><strong>Status:</strong> {selectedError.status}</p>
                <p><strong>Time:</strong> {new Date(selectedError.timestamp).toLocaleString()}</p>
              </div>

              <div className="modal-message">
                <strong>Message:</strong>
                <p>{selectedError.message}</p>
              </div>

              <div className="modal-stack">
                <strong>Stack Trace:</strong>
                <div className="stack-trace-box">
                  <pre>{selectedError.stackTrace || 'No stack trace available.'}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

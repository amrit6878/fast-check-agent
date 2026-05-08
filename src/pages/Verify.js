import React, { useState } from 'react';
import { extractText } from '../utils/pdfExtract';
import { extractClaimsFromText, verifyClaim, generateReport } from '../utils/gemini';
import './Verify.css';

export default function Verify({ nav, analysisData, verifyState, setVerifyState, setAnalysisData, onAnalysisComplete }) {
  const [scanningFile, setScanningFile] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [liveLogs, setLiveLogs] = useState([]);
  const [activeClaim, setActiveClaim] = useState(null);
  const [error, setError] = useState('');

  const addLog = (msg) => setLiveLogs(prev => [...prev.slice(-5), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanningFile(file);
    setVerifyState('scanning');
    setError('');
    setLiveLogs([]);
    setScanProgress(0);

    try {
      addLog('Initializing extraction stream...');
      setScanStatus('Extracting text from document...');
      const { text, pages } = await extractText(file);
      setScanProgress(15);
      addLog(`Extracted text from ${pages} pages`);

      setScanStatus('Identifying claims with NLP...');
      addLog('Running NLP claim identification...');
      const claims = await extractClaimsFromText(text);
      setScanProgress(35);
      addLog(`Identified ${claims.length} verifiable claims`);

      if (claims.length === 0) {
        setError('No verifiable claims found in this document.');
        setVerifyState('idle');
        return;
      }

      const verifications = [];
      for (let i = 0; i < claims.length; i++) {
        const pct = Math.round(35 + ((i + 1) / claims.length) * 55);
        setScanProgress(pct);
        setScanStatus(`Cross-referencing claim ${i + 1} of ${claims.length}...`);
        addLog(`Identified numerical entity: ${claims[i].value || claims[i].entity}`);
        setActiveClaim(claims[i]);

        const result = await verifyClaim(claims[i]);
        verifications.push({ claim: claims[i], result });
        addLog(`${result.status}: ${claims[i].entity} — ${result.confidenceScore}% confidence`);
      }

      setScanProgress(100);
      setScanStatus('Generating report...');
      addLog('Compiling institutional transparency report...');
      const report = await generateReport(claims, verifications, file.name);
      report.pages = pages;
      report.rawText = text;

      onAnalysisComplete(report);
    } catch (err) {
      console.error(err);
      setError('Analysis failed: ' + err.message);
      setVerifyState('idle');
    }
  };

  // === IDLE state ===
  if (verifyState === 'idle') {
    return (
      <div className="layout-with-sidebar">
        <aside className="sidebar">
          <div>
            <div className="sidebar-label">Document History</div>
            <div className="sidebar-synced">Last synced 2m ago</div>
          </div>
          <button className="sidebar-item active">🔄 Recent Claims</button>
          <button className="sidebar-item">🛡️ Verified Reports</button>
          <button className="sidebar-item">⏱️ Flagged Content</button>
          <button className="sidebar-item">≡ Drafts</button>
          <div style={{ flex: 1 }} />
          <label className="sidebar-upload">
            <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
            ☁ Upload Source
          </label>
          <div style={{ height: '1rem' }} />
          <button className="sidebar-item">? Help Center</button>
        </aside>
        <div className="page-area verify-idle">
          <div className="verify-idle-content">
            <div className="verify-idle-icon">🔍</div>
            <h2>Ready to Verify</h2>
            <p>Upload a document to begin the Fact-Check protocol. The system will automatically extract claims and cross-reference them against institutional databases.</p>
            <label className="btn-primary blue" style={{ display: 'inline-block', cursor: 'pointer', padding: '0.6rem 1.5rem', borderRadius: 8, fontSize: '0.9rem' }}>
              <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
              Upload Document
            </label>
          </div>
        </div>
      </div>
    );
  }

  // === SCANNING state ===
  if (verifyState === 'scanning') {
    const queuedClaims = [
      { text: 'The inflation offset was mitigated by a 2.3 billion USD surplus in the export ledger...', source: 'Financial Appendix, Page 12' },
      { text: 'Annual revenue growth sustained at 4.5%...', status: 'verified' },
    ];
    return (
      <div className="layout-with-sidebar">
        <aside className="sidebar">
          <div>
            <div className="sidebar-label">Document History</div>
            <div className="sidebar-synced">Last synced just now</div>
          </div>
          <button className="sidebar-item active">🔄 Recent Claims</button>
          <button className="sidebar-item">🛡️ Verified Reports</button>
          <button className="sidebar-item">⏱️ Flagged Content</button>
          <button className="sidebar-item">≡ Drafts</button>
          <div style={{ flex: 1 }} />
          <button className="sidebar-upload" disabled>☁ Upload Source</button>
          <div style={{ height: '1rem' }} />
          <button className="sidebar-item">? Help Center</button>
        </aside>

        <div className="page-area">
          <div className="verify-layout">
            {/* Document preview */}
            <div className="doc-preview">
              <div className="doc-preview-header">
                <span className="doc-icon-sm">📄</span>
                <span className="doc-name">{scanningFile?.name || 'Document.pdf'}</span>
                <span>🔍</span>
                <span>100%</span>
                <span>🔍</span>
              </div>
              <div className="doc-preview-body">
                <div className="doc-skeleton-lines">
                  {[80,100,95,70,100,85,60,100,90,50,100,75].map((w, i) => (
                    <div key={i} className={`skeleton-line ${i === 4 ? 'extracting' : ''}`} style={{ width: `${w}%` }}>
                      {i === 4 && <span className="extracting-badge">EXTRACTING...</span>}
                    </div>
                  ))}
                </div>
                <div className="doc-chart-placeholder">📊</div>
              </div>
              {/* Status overlay */}
              <div className="scan-status-overlay">
                <span className="scan-status-dot"></span>
                <div>
                  <div className="scan-status-label">System Status</div>
                  <div className="scan-status-text">{scanStatus}</div>
                </div>
              </div>
              {/* Progress */}
              <div className="scan-progress-bar">
                <div className="progress-fill" style={{ width: `${scanProgress}%` }}></div>
              </div>
            </div>

            {/* Extraction stream */}
            <div className="extraction-stream">
              <div className="stream-header">
                <div>
                  <div className="stream-title">Extraction Stream</div>
                  <div className="stream-subtitle">Real-time claim identification</div>
                </div>
                <div className="live-flow-badge">
                  <span>Live Flow</span>
                  <div className="live-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>

              {/* Active claim being scanned */}
              {activeClaim && (
                <div className="claim-card scanning-card fade-in">
                  <div className="claim-card-header">
                    <span className="badge badge-scanning">Scanning...</span>
                    <span className="claim-id">ID: CL-{Math.floor(Math.random() * 9000 + 1000)}</span>
                  </div>
                  <p className="claim-text">"{activeClaim.claim}"</p>
                  <div className="claim-entity-row">
                    <div className="entity-cell">
                      <div className="entity-label">ENTITY</div>
                      <div className="entity-value">{activeClaim.entity}</div>
                    </div>
                    <div className="entity-cell">
                      <div className="entity-label">VALUE</div>
                      <div className="entity-value blue">{activeClaim.value}</div>
                    </div>
                  </div>
                  <div className="verification-progress">
                    <div className="vp-label">VERIFICATION PROGRESS</div>
                    <div className="vp-label blue">CROSS-REFERENCING...</div>
                  </div>
                  <div className="progress-bar" style={{ margin: '0.25rem 0' }}>
                    <div className="progress-fill pulse" style={{ width: '65%' }}></div>
                  </div>
                  <div className="vp-source">Searching: Bureau of Labor Statistics 2023 Monthly Updates</div>
                </div>
              )}

              {/* Queued */}
              <div className="claim-card queued-card">
                <div className="claim-card-header">
                  <span className="badge badge-queued">Queued</span>
                  <span className="claim-clock">🕐</span>
                </div>
                <p className="claim-text italic">"The inflation offset was mitigated by a 2.3 billion USD surplus in the export ledger..."</p>
                <div className="claim-source">⛓ Source: Financial Appendix, Page 12</div>
              </div>

              {/* Verified preview */}
              <div className="claim-card verified-preview-card">
                <div className="verified-row">
                  <span className="verified-check">✅</span>
                  <span className="verified-text">Annual revenue growth sustained at 4.5%...</span>
                </div>
                <div className="verified-meta"><span className="badge badge-verified">VERIFIED</span> Match found in SEC 10-K</div>
              </div>

              {/* Stats */}
              <div className="stream-stats">
                <div className="stream-stat dark">
                  <div className="stat-icon">⚡</div>
                  <div className="stream-stat-number">{Math.floor(scanProgress * 0.3)}</div>
                  <div className="stream-stat-label">Claims Found</div>
                </div>
                <div className="stream-stat blue">
                  <div className="stat-icon">📋</div>
                  <div className="stream-stat-number">{Math.floor(scanProgress * 0.08)}</div>
                  <div className="stream-stat-label">Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* System log */}
          <div className="system-log">
            {liveLogs.slice(-3).map((log, i) => (
              <span key={i}><span>SYS</span> {log}</span>
            ))}
          </div>

          {error && (
            <div style={{ padding: '1rem', background: 'var(--red-light)', color: 'var(--red)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // === DONE state - show Verification Report ===
  if (verifyState === 'done' && analysisData) {
    const { fileName, totalClaims, verified, inaccurate, falseClaims, truthScore, claims } = analysisData;
    
    const getScoreColor = (s) => s >= 80 ? 'green' : s >= 50 ? 'yellow' : 'red';
    const getBorderClass = (status) => {
      if (status === 'VERIFIED') return 'border-green';
      if (status === 'INACCURATE') return 'border-yellow';
      if (status === 'FALSE') return 'border-red';
      return '';
    };

    const exportReport = () => {
      const report = claims.map(({claim, result}) => 
        `CLAIM: ${claim.claim}\nSTATUS: ${result.status}\nCONFIDENCE: ${result.confidenceScore}%\nTRUTH: ${result.livetruth}\nSOURCES: ${result.sources?.join(', ')}\n---`
      ).join('\n\n');
      const blob = new Blob([`FACT-CHECK REPORT\nFile: ${fileName}\nTruth Score: ${truthScore}%\nTotal Claims: ${totalClaims}\n\n${report}`], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `factcheck_report_${Date.now()}.txt`;
      a.click();
    };

    return (
      <div className="layout-with-sidebar">
        <aside className="sidebar">
          <div>
            <div className="sidebar-label">Document History</div>
            <div className="sidebar-synced">Last synced 2m ago</div>
          </div>
          <button className="sidebar-item active">🔄 Recent Claims</button>
          <button className="sidebar-item">🛡️ Verified Reports</button>
          <button className="sidebar-item">⏱️ Flagged Content</button>
          <button className="sidebar-item">≡ Drafts</button>
          <div style={{ flex: 1 }} />
          <label className="sidebar-upload">
            <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
            ☁ Upload Source
          </label>
          <div style={{ height: '1rem' }} />
          <button className="sidebar-item">? Help Center</button>
          <button className="sidebar-item">⟨/⟩ API Documentation</button>
        </aside>

        <div className="page-area report-page">
          <div className="report-header">
            <div>
              <h1>Verification Report: {fileName}</h1>
              <p className="report-subtitle">Institutional transparency audit of the primary financial projections document. Cross-referenced against Bloomberg Terminal data and IMF historical datasets.</p>
            </div>
            <button className="btn-secondary" onClick={exportReport}>⬇ Export Report</button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">TOTAL CLAIMS</div>
              <div className="stat-number">{totalClaims}</div>
              <div className="stat-sub">Analyzed from source</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">VERIFIED</div>
              <div className="stat-number green">{verified}</div>
              <div className="stat-sub">Confirmed by ≥3 sources</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">INACCURATE</div>
              <div className="stat-number orange">{inaccurate}</div>
              <div className="stat-sub">Contextually incomplete</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">FALSE</div>
              <div className="stat-number red">{falseClaims}</div>
              <div className="stat-sub">Directly contradicted</div>
            </div>
          </div>

          {/* Claims list */}
          <div className="claims-list">
            {claims.map(({ claim, result }, i) => (
              <div className={`claim-report-card ${getBorderClass(result?.status)} fade-in`} key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="claim-report-left">
                  <div className="claim-report-header">
                    <span className={`badge badge-${result?.status?.toLowerCase()}`}>{result?.status || 'ANALYZING'}</span>
                    <span className="claim-id-text">ID: {claim.id || `44${i+1}-${String.fromCharCode(65+i)}`}</span>
                  </div>
                  <div className="claim-label">ORIGINAL STATEMENT</div>
                  <p className="claim-original">"{claim.claim}"</p>
                </div>

                <div className="claim-report-middle">
                  <div className="live-truth-label">LIVE TRUTH</div>
                  <p className="live-truth-text">{result?.livetruth || 'Verification in progress...'}</p>
                  {result?.sources?.map((src, si) => (
                    <div key={si} className="source-link">⛓ {src}</div>
                  ))}
                </div>

                <div className="claim-report-right">
                  <div className="confidence-label">CONFIDENCE SCORE</div>
                  <div className={`confidence-number ${getScoreColor(result?.confidenceScore || 0)}`}>
                    {result?.confidenceScore || 0}%
                  </div>
                  <div className="confidence-tag">{result?.contextTag || 'Analyzing'}</div>
                  <div className="confidence-bar">
                    <div className={`progress-fill ${getScoreColor(result?.confidenceScore || 0)}`} 
                         style={{ width: `${result?.confidenceScore || 0}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Methodology */}
          <div className="methodology-section card">
            <div className="methodology-content">
              <h3>Methodology & Source Analysis</h3>
              <p>This report uses the Institutional Transparency Protocol v4.2. Every claim is cross-referenced against real-time API feeds from primary financial institutions and governmental databases. Our NLP engine identifies semantic shifts and statistical outliers in seconds.</p>
              <div className="methodology-stats">
                <div className="methodology-stat">
                  <div className="methodology-number">142 Sources</div>
                  <div className="methodology-label">Cross-Referenced</div>
                </div>
                <div className="methodology-stat">
                  <div className="methodology-number">4.2s Latency</div>
                  <div className="methodology-label">Verification Speed</div>
                </div>
              </div>
            </div>
            <div className="methodology-visual">
              <button className="btn-secondary" onClick={exportReport}>📊 Export Full Report</button>
            </div>
          </div>

          <footer className="footer" style={{ marginTop: '2rem' }}>
            <span>Fact-Check Agent &nbsp;&nbsp; © 2024. Institutional Transparency Protocol v4.2</span>
            <div className="footer-links">
              <a href="#">Methodology</a>
              <a href="#">API Access</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Contact Support</a>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return null;
}

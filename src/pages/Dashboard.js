import React, { useState, useCallback } from 'react';
import { extractText } from '../utils/pdfExtract';
import { extractClaimsFromText, verifyClaim, generateReport } from '../utils/gemini';
import './Dashboard.css';

export default function Dashboard({ nav, recentAnalyses, onAnalysisComplete }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  const processFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|docx)$/i)) {
      setError('Please upload a PDF, TXT, or DOCX file (Max 50MB)');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Max 50MB.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      setUploadProgress('Extracting text from document...');
      const { text, pages } = await extractText(file);

      setUploadProgress('Identifying verifiable claims with AI...');
      const claims = await extractClaimsFromText(text);

      if (claims.length === 0) {
        setError('No verifiable claims found in document. Try a different file.');
        setUploading(false);
        return;
      }

      setUploadProgress(`Found ${claims.length} claims. Cross-referencing with live data...`);

      const verifications = [];
      for (let i = 0; i < claims.length; i++) {
        setUploadProgress(`Verifying claim ${i + 1} of ${claims.length}: "${claims[i].claim.slice(0, 60)}..."`);
        const result = await verifyClaim(claims[i]);
        verifications.push({ claim: claims[i], result });
      }

      setUploadProgress('Generating institutional transparency report...');
      const report = await generateReport(claims, verifications, file.name);
      report.pages = pages;
      report.rawText = text;

      onAnalysisComplete(report);
    } catch (err) {
      console.error(err);
      setError('Analysis failed: ' + err.message);
      setUploading(false);
      setUploadProgress('');
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const statusClass = (s) => {
    if (s === 'VERIFIED') return 'badge badge-verified';
    if (s === 'MISLEADING') return 'badge badge-misleading';
    if (s === 'INACCURATE' || s === 'FALSE') return 'badge badge-inaccurate';
    return 'badge badge-queued';
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-left">
          <div className="protocol-tag">Institutional Transparency Protocol v4.2</div>
          <h1>The Truth Layer for<br />Complex Documents.</h1>
          <p>Deploy our institutional-grade agent to verify claims, extract hidden data, and generate objective reports. Designed for journalists, researchers, and legal professionals.</p>
          <div className="hero-badges">
            <span className="hero-badge">✅ Objective Analysis</span>
            <span className="hero-badge">🔄 Full Audit Trail</span>
          </div>
        </div>

        <div className={`upload-dropzone ${dragging ? 'dragging' : ''} ${uploading ? 'loading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {uploading ? (
            <div className="upload-loading">
              <div className="upload-icon-box loading">
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }}></span>
              </div>
              <h3>Analyzing Document</h3>
              <p className="upload-progress-text pulse">{uploadProgress}</p>
            </div>
          ) : (
            <>
              <div className="upload-icon-box">
                <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3>Verify Document</h3>
              <p>Drag and drop your PDF report, whitepaper, or article here to begin the Fact-Check protocol.</p>
              <label className="select-file-btn">
                <input type="file" accept=".pdf,.txt,.docx" onChange={onFileChange} style={{ display: 'none' }} />
                Select Source File
              </label>
              <p className="supported-formats">Supported: PDF, DOCX, TXT (Max 50MB)</p>
            </>
          )}
          {error && <div className="upload-error">{error}</div>}
        </div>
      </div>

      {/* Protocol phases */}
      <div className="protocol-section">
        <h2 className="section-title"><span className="section-bar"></span>The Protocol</h2>
        <div className="phases-grid">
          <div className="phase-card">
            <div className="phase-tag">Phase 01</div>
            <h3>Extract</h3>
            <p>Advanced OCR and NLP algorithms parse the document into atomic claims and data points, stripping away rhetorical flourishes.</p>
            <div className="phase-icon">☰</div>
          </div>
          <div className="phase-card active">
            <div className="phase-tag">Phase 02</div>
            <h3>Verify</h3>
            <p>Each claim is cross-referenced against 500+ verified institutional databases, peer-reviewed journals, and archival records.</p>
            <div className="phase-icon">☑</div>
          </div>
          <div className="phase-card">
            <div className="phase-tag">Phase 03</div>
            <h3>Report</h3>
            <p>Generate an Institutional Transparency Report with highlighted risk areas, truth scores, and primary source citations.</p>
            <div className="phase-icon">📄</div>
          </div>
        </div>
      </div>

      {/* Recent analyses */}
      <div className="recent-section">
        <div className="recent-header">
          <h2 className="section-title"><span className="section-bar"></span>Recent Analyses</h2>
          <button className="view-archive-btn" onClick={() => nav('archive')}>View Archive →</button>
        </div>
        <div className="analyses-table">
          <div className="table-header">
            <span>DOCUMENT NAME</span>
            <span>STATUS</span>
            <span>TRUTH SCORE</span>
            <span>DATE</span>
          </div>
          {recentAnalyses.map((a, i) => (
            <div className="table-row" key={i}>
              <div className="table-doc">
                <span className="doc-icon">📄</span>
                <span>{a.name}</span>
              </div>
              <div><span className={statusClass(a.status)}>{a.status}</span></div>
              <div className="truth-score">{a.score}%</div>
              <div className="table-date">{a.date}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        <span>Fact-Check Agent &nbsp;&nbsp; © 2024. Institutional Transparency Protocol v4.2. All rights reserved.</span>
        <div className="footer-links">
          <a href="#">Methodology</a>
          <a href="#">API Access</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Sources from './pages/Sources';
import Archive from './pages/Archive';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [analysisData, setAnalysisData] = useState(null);
  const [verifyState, setVerifyState] = useState('idle'); // idle | scanning | done
  const [recentAnalyses, setRecentAnalyses] = useState([
    { name: 'Global_Emissions_Report_2023.pdf', status: 'VERIFIED', score: 94.2, date: '2h ago' },
    { name: 'Market_Trend_Analysis_Q4.docx', status: 'MISLEADING', score: 68.5, date: '5h ago' },
    { name: 'Political_Ad_Claims_Campaign_X.pdf', status: 'INACCURATE', score: 22.1, date: 'Yesterday' },
  ]);

  const nav = (p) => setPage(p);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setVerifyState('done');
    // add to recent
    setRecentAnalyses(prev => [{
      name: data.fileName,
      status: data.overallStatus,
      score: data.truthScore,
      date: 'Just now'
    }, ...prev]);
    setPage('verify');
  };

  const handleNewAnalysis = () => {
    setVerifyState('idle');
    setAnalysisData(null);
    setPage('dashboard');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">Fact-Check Agent</div>
        <div className="navbar-links">
          {['dashboard','verify','sources','archive'].map(p => (
            <button key={p} className={`nav-link ${page === p ? 'active' : ''}`} onClick={() => nav(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="navbar-actions">
          <button className="icon-btn">🔔</button>
          <button className="icon-btn">⚙️</button>
          <button className="btn-primary" onClick={handleNewAnalysis}>New Analysis</button>
          <div className="avatar">JD</div>
        </div>
      </nav>

      <main className="main-content">
        {page === 'dashboard' && (
          <Dashboard
            nav={nav}
            recentAnalyses={recentAnalyses}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        {page === 'verify' && (
          <Verify
            nav={nav}
            analysisData={analysisData}
            verifyState={verifyState}
            setVerifyState={setVerifyState}
            setAnalysisData={setAnalysisData}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        {page === 'sources' && <Sources nav={nav} />}
        {page === 'archive' && <Archive nav={nav} recentAnalyses={recentAnalyses} />}
      </main>
    </div>
  );
}

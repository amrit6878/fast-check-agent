import React, { useState } from 'react';
import './Archive.css';

const sampleLogs = [
  { doc: 'Public health advisory regarding Z-20 strain...', url: 'who.int/news/2024/03', score: 94, date: '2024-10-12 14:32', color: '#2563EB' },
  { doc: 'Quarterly GDP fluctuations in Emerging Markets', url: 'reuters_archive_822.pdf', score: 62, date: '2024-10-10 09:15', color: '#DC2626' },
  { doc: 'Carbon sequestration efficacy in boreal forests', url: 'nature.com/articles/s415', score: 88, date: '2024-10-08 17:45', color: '#2563EB' },
  { doc: 'Infrastructure spending vs projected inflation index', url: 'gov.archive/finance/report', score: 41, date: '2024-10-05 11:20', color: '#DC2626' },
];

export default function Archive({ nav, recentAnalyses }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const sourceConnections = [
    { name: 'REUTERS API', status: 'active', conn: 'Connected: Global News Index', lat: '42ms' },
    { name: 'WIKIDATA DUMP', status: 'syncing', conn: 'Connected: 2024-Q3 Knowledge Base', lat: '11ms' },
    { name: 'LEXISNEXIS', status: 'pending', conn: 'Connection pending...', lat: '--' },
  ];

  return (
    <div className="layout-with-sidebar">
      <aside className="sidebar">
        <div>
          <div className="sidebar-label">Document History</div>
          <div className="sidebar-synced">Last synced 2m ago</div>
        </div>
        <button className="sidebar-item">🔄 RECENT CLAIMS</button>
        <button className="sidebar-item active">🛡️ VERIFIED REPORTS</button>
        <button className="sidebar-item">⏱️ FLAGGED CONTENT</button>
        <button className="sidebar-item">≡ DRAFTS</button>
        <div style={{ flex: 1 }} />
        <button className="sidebar-upload">📄 Upload Source</button>
        <div style={{ height: '1rem' }} />
        <button className="sidebar-item">? HELP CENTER</button>
        <button className="sidebar-item">⟨/⟩ API DOCUMENTATION</button>
      </aside>

      <div className="page-area archive-page">
        <div className="archive-header">
          <div>
            <h1>History & Sources</h1>
            <p>Manage your institutional archive and active data integration streams.</p>
          </div>
          <input
            className="archive-search"
            placeholder="🔍  Search archive by claim, URL, or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="archive-grid">
          <div className="archive-main">
            <div className="card">
              <div className="archive-table-header">
                <h3>Analysis Logs</h3>
                <div className="archive-table-actions">
                  <button className="btn-secondary">≡ Filter</button>
                  <button className="btn-secondary">⬇ Export</button>
                </div>
              </div>

              <div className="archive-col-header">
                <span>Document / Claim</span>
                <span>Truth Score</span>
                <span>Analyzed On</span>
                <span>Actions</span>
              </div>

              {sampleLogs.filter(l => !search || l.doc.toLowerCase().includes(search.toLowerCase())).map((log, i) => (
                <div key={i} className="archive-row">
                  <div className="archive-doc">
                    <div className="archive-doc-name">{log.doc}</div>
                    <div className="archive-doc-url">⛓ {log.url}</div>
                  </div>
                  <div className="archive-score">
                    <div className="archive-score-bar">
                      <div className="archive-score-fill" style={{ width: `${log.score}%`, background: log.color }}></div>
                    </div>
                    <span className="archive-score-num" style={{ color: log.color }}>{log.score}%</span>
                  </div>
                  <div className="archive-date">
                    {log.date.split(' ').map((d, i) => <div key={i}>{d}</div>)}
                  </div>
                  <div className="archive-actions">
                    <button className="icon-btn">•••</button>
                  </div>
                </div>
              ))}

              {/* User's recent analyses */}
              {recentAnalyses.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase())).map((a, i) => (
                <div key={`user-${i}`} className="archive-row">
                  <div className="archive-doc">
                    <div className="archive-doc-name">{a.name}</div>
                    <div className="archive-doc-url">⛓ user uploaded</div>
                  </div>
                  <div className="archive-score">
                    <div className="archive-score-bar">
                      <div className="archive-score-fill" style={{ width: `${a.score}%`, background: a.score >= 80 ? '#2563EB' : '#DC2626' }}></div>
                    </div>
                    <span className="archive-score-num" style={{ color: a.score >= 80 ? '#2563EB' : '#DC2626' }}>{a.score}%</span>
                  </div>
                  <div className="archive-date">
                    <div>{a.date}</div>
                  </div>
                  <div className="archive-actions">
                    <button className="icon-btn">•••</button>
                  </div>
                </div>
              ))}

              <div className="archive-pagination">
                <span>Showing 1-10 of 482 entries</span>
                <div className="page-btns">
                  <button className="page-btn">‹</button>
                  <button className="page-btn active">1</button>
                  <button className="page-btn">2</button>
                  <button className="page-btn">3</button>
                  <button className="page-btn">›</button>
                </div>
              </div>
            </div>
          </div>

          {/* Source manager sidebar */}
          <div className="archive-sidebar-info">
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="source-manager-header">
                <span className="source-manager-icon">🗄️</span>
                <h3>Source Manager</h3>
              </div>
              {sourceConnections.map((s, i) => (
                <div key={i} className="source-mini-card">
                  <div className="source-mini-header">
                    <span className="source-mini-name">{s.name}</span>
                    <span className={`source-dot ${s.status}`}></span>
                  </div>
                  <div className="source-mini-conn">{s.conn}</div>
                  <div className="source-mini-meta">
                    <span>Lat: {s.lat}</span>
                    <span className={`source-mini-status ${s.status}`}>
                      {s.status === 'active' ? 'Active' : s.status === 'syncing' ? 'Syncing' : <button className="source-connect-btn">CONNECT</button>}
                    </span>
                  </div>
                </div>
              ))}
              <button className="manage-sources-btn">Manage All Sources</button>
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="sidebar-card-label">STORAGE & USAGE</div>
              <div className="storage-big">12.4 <span>GB</span> <span className="archived-tag">Archived</span></div>
              <div className="progress-bar" style={{ margin: '0.5rem 0 0.35rem' }}>
                <div className="progress-fill" style={{ width: '78%', background: '#F59E0B' }}></div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>78% of institutional quota used.</div>
            </div>

            <div className="card featured-dark">
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: 4 }}>Featured Integration</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Global Health Ledger v2.1</div>
            </div>
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

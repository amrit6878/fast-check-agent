import React from 'react';
import './Sources.css';

const sources = [
  { name: 'REUTERS API', status: 'active', connection: 'Connected: Global News Index', lat: '42ms', color: '#16A34A' },
  { name: 'WIKIDATA DUMP', status: 'syncing', connection: 'Connected: 2024-Q3 Knowledge Base', lat: '11ms', color: '#2563EB' },
  { name: 'LEXISNEXIS', status: 'pending', connection: 'Connection pending...', lat: '--', color: '#9CA3AF' },
  { name: 'Bloomberg Terminal', status: 'active', connection: 'Connected: Financial Markets', lat: '18ms', color: '#16A34A' },
  { name: 'IMF Data API', status: 'active', connection: 'Connected: Economic Databases', lat: '55ms', color: '#16A34A' },
  { name: 'BLS Statistics', status: 'active', connection: 'Connected: Labor Data', lat: '33ms', color: '#16A34A' },
];

export default function Sources({ nav }) {
  return (
    <div className="sources-page">
      <div className="sources-header">
        <div>
          <h1>Source Manager</h1>
          <p>Manage your data integration streams and institutional source connections.</p>
        </div>
        <button className="btn-primary blue">+ Add Source</button>
      </div>

      <div className="sources-grid">
        <div className="sources-main">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="sources-search">
              <span>🔍</span>
              <input type="text" placeholder="Search sources by name, type, or status..." />
            </div>
          </div>

          <div className="sources-list">
            {sources.map((s, i) => (
              <div key={i} className="source-row card" style={{ marginBottom: '0.75rem' }}>
                <div className="source-info">
                  <div className="source-icon" style={{ background: s.status === 'active' ? '#DCFCE7' : s.status === 'syncing' ? '#EFF6FF' : '#F3F4F6' }}>
                    🗄️
                  </div>
                  <div>
                    <div className="source-name">{s.name}</div>
                    <div className="source-conn">{s.connection}</div>
                  </div>
                </div>
                <div className="source-stats">
                  <div className="source-stat">
                    <div className="source-stat-label">Latency</div>
                    <div className="source-stat-value">{s.lat}</div>
                  </div>
                  <div className="source-stat">
                    <div className="source-stat-label">Status</div>
                    <div>
                      <span className={`status-dot`} style={{ background: s.color }}></span>
                      <span className="source-status-text">{s.status === 'active' ? 'Active' : s.status === 'syncing' ? 'Syncing' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
                <div className="source-actions">
                  {s.status === 'pending' ? (
                    <button className="btn-secondary">CONNECT</button>
                  ) : (
                    <button className="btn-secondary">Manage</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sources-sidebar-info">
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 className="sidebar-card-title">Storage & Usage</h3>
            <div className="storage-number">12.4 GB <span className="storage-label">Archived</span></div>
            <div className="progress-bar" style={{ margin: '0.75rem 0 0.35rem' }}>
              <div className="progress-fill" style={{ width: '78%', background: '#F59E0B' }}></div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>78% of institutional quota used.</div>
          </div>

          <div className="card featured-integration">
            <div className="featured-bg">
              <div className="featured-label">Featured Integration</div>
              <div className="featured-name">Global Health Ledger v2.1</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h3 className="sidebar-card-title">Quick Stats</h3>
            <div className="quick-stat"><span>Active Sources</span><span className="qs-value green">5</span></div>
            <div className="quick-stat"><span>Avg Latency</span><span className="qs-value">31ms</span></div>
            <div className="quick-stat"><span>Claims/Day</span><span className="qs-value">482</span></div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <span>Fact-Check Agent &nbsp;&nbsp; © 2024. Institutional Transparency Protocol v4.2</span>
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

import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalRoutes: 0,
    recordCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${window.gatewayAdminScript.apiUrl}gateway/v1/admin-data`,
        {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();

      // Calculate total routes
      const totalRoutes = data.collections.reduce((sum, collection) => {
        return sum + (collection.routes ? collection.routes.length : 0);
      }, 0);

      setStats({
        totalCollections: data.collections.length,
        totalRoutes: totalRoutes,
        recordCount: data.record_count ?? 0,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  // Mockup data for API Requests chart (past 8 weeks, grouped by week)
  const apiRequestsData = [
    { week: '2025-09-29', total: 120 },
    { week: '2025-10-06', total: 150 },
    { week: '2025-10-13', total: 180 },
    { week: '2025-10-20', total: 210 },
    { week: '2025-10-27', total: 170 },
    { week: '2025-11-03', total: 220 },
    { week: '2025-11-10', total: 260 },
    { week: '2025-11-17', total: 300 },
  ];

  return (
    <div className="gty-dashboard">
      <div className="gty-dashboard__stats-grid">
        <StatCard
          title="Collections"
          value={loading ? '...' : stats.totalCollections}
        />
        <StatCard
          title="Routes"
          value={loading ? '...' : stats.totalRoutes}
        />
        <StatCard
          title="Records"
          value={loading ? '...' : stats.recordCount}
        />
      </div>

      {/* New row: 1/3 links, 2/3 chart */}
      <div className="gty-dashboard__row">
        {/* 40% column: links */}
        <div className="gty-dashboard__links-col">
          <div className="gty-dashboard__links-group">
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Documentation</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Usage Guide</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Reference</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Changelog</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
          </div>
          <div className="gty-dashboard__links-group">
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Limits</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Status</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Keys</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" className="gty-dashboard__link"><span className="gty-dashboard__link-label">API Support</span><span className="gty-dashboard__link-icon"><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
          </div>
        </div>
        {/* 60% column: chart */}
        <div className="gty-dashboard__chart-col">
          <div className="gty-dashboard__chart-title">API Requests (last 8 weeks)</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={apiRequestsData} margin={{ top: 10, right: 40, left: 20, bottom: 30 }}>
              {/* No grid lines */}
              <XAxis
                dataKey="week"
                tickFormatter={w => w.slice(5).replace('-', '/')}
                tick={{
                  fontFamily: 'var(--font-geist)',
                  fontSize: 11,
                  fill: '#888',
                  angle: -35,
                  textAnchor: 'end',
                  dy: 16,
                }}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={40}
              />
              <YAxis
                tick={({ x, y, payload }) => {
                  const values = apiRequestsData.map(d => d.total);
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const mid = Math.round((min + max) / 2);
                  if (payload.value === min || payload.value === max || payload.value === mid) {
                    return (
                      <text x={x - 8} y={y} dy={4} textAnchor="end" fontFamily="var(--font-geist)" fontSize={11} fill="#888">{payload.value}</text>
                    );
                  }
                  return null;
                }}
                axisLine={false}
                tickLine={false}
                width={40}
                domain={['dataMin', 'dataMax']}
                padding={{ left: 8, right: 0 }}
              />
              <Tooltip formatter={v => v.toLocaleString()} labelFormatter={l => `Week of ${l}`} />
              <Line type="monotone" dataKey="total" stroke="#2271B1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

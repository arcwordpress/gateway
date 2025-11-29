import { useState, useEffect } from '@wordpress/element';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalRoutes: 0,
    recordCount: 0,
  });
  const [apiRequestsData, setApiRequestsData] = useState([]);
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

      // Use real API request data if available
      setApiRequestsData(data.weekly_request_totals ?? []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

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
        {/* 30% column: links */}
        <div className="gty-dashboard__links-col">
          <div className="gty-dashboard__links-group">
            <Link to="/settings" className="gty-dashboard__link">
              <span className="gty-dashboard__link-label">Manage Settings</span>
              <span className="gty-dashboard__link-icon">
                <svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z"/></svg>
              </span>
            </Link>
            <Link to="/collections" className="gty-dashboard__link">
              <span className="gty-dashboard__link-label">View Collections</span>
              <span className="gty-dashboard__link-icon">
                <svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </span>
            </Link>
            <Link to="/chat" className="gty-dashboard__link">
              <span className="gty-dashboard__link-label">Chat with Maze</span>
              <span className="gty-dashboard__link-icon">
                <svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
            </Link>
          </div>
        </div>
        {/* 70% column: chart */}
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

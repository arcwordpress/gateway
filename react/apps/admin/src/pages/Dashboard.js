import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalRoutes: 0,
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
    <div className="px-4 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
          value="1,285"
        />
      </div>

      {/* New row: 1/3 links, 2/3 chart */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
        {/* 40% column: links */}
        <div style={{ flex: '0 0 40%', minWidth: 0, display: 'flex', flexDirection: 'row', gap: '2rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Documentation</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Usage Guide</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Reference</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Changelog</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Limits</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Status</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Keys</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#2271B1', textDecoration: 'none', fontFamily: 'var(--font-geist)', fontSize: '0.98rem', letterSpacing: '0.01em', justifyContent: 'space-between', minWidth: 0 }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>API Support</span><span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center' }}><svg width="18" height="18" fill="none" stroke="#2271B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
          </div>
        </div>
        {/* 60% column: chart */}
        <div
          style={{
            flex: '0 0 60%',
            minWidth: 0,
            background: '#EEEEEE',
            borderRadius: 0,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontFamily: 'var(--font-geist)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem', color: '#1D2327' }}>API Requests (last 8 weeks)</div>
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
                  dy: 16, // move labels lower
                }}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={40}
              />
              <YAxis
                tick={({ x, y, payload, ...rest }) => {
                  // Show min, midpoint, and max
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

import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';

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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Collections"
          value={loading ? '...' : stats.totalCollections}
          description="Registered collections"
        />
        <StatCard
          title="Total Routes"
          value={loading ? '...' : stats.totalRoutes}
          description="API endpoints registered"
        />
      </div>
    </div>
  );
}

export default Dashboard;

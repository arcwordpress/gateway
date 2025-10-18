import { Grid } from '@gateway/grid';

function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-6">Welcome to Gateway Admin Dashboard</p>
        </div>

        <div>
          <Grid collectionKey="tests" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

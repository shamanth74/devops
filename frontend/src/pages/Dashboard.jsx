import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeploymentCard from '../components/DeploymentCard';

/**
 * Dashboard — main landing page.
 * Fetches all deployments and renders them as a responsive grid of cards.
 * Provides approve / reject / deploy action handlers.
 */
function Dashboard() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all deployments from the API
  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/deployments');
      setDeployments(data);
    } catch (err) {
      console.error('Failed to fetch deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  // ---- Action handlers ----

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/deployments/${id}/approve`);
      fetchDeployments();
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/deployments/${id}/reject`);
      fetchDeployments();
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  const handleDeploy = async (id) => {
    try {
      await axios.put(`/api/deployments/${id}/deploy`);
      fetchDeployments();
    } catch (err) {
      console.error('Deploy failed:', err);
    }
  };

  // ---- Render ----

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading deployments…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Deployment Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          {deployments.length} deployment{deployments.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Empty state */}
      {deployments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-5xl mb-4">📭</span>
          <p className="text-gray-400 text-lg">No pending deployments</p>
          <p className="text-gray-600 text-sm mt-1">
            New deployments will appear here when triggered by CI.
          </p>
        </div>
      ) : (
        /* Deployment grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deployments.map((dep) => (
            <DeploymentCard
              key={dep.id}
              deployment={dep}
              onApprove={handleApprove}
              onReject={handleReject}
              onDeploy={handleDeploy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;

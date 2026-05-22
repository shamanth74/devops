import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

/**
 * History — chronological table of all deployments sorted newest-first.
 */

// Safety label colour helpers
const SAFETY_COLORS = {
  Safe: 'text-green-400',
  'Needs Review': 'text-yellow-400',
  'High Impact': 'text-red-400',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
};

function History() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/deployments');
        // Sort newest first
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDeployments(sorted);
      } catch (err) {
        console.error('Failed to fetch deployments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading history…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Deployment History</h1>
        <p className="text-gray-400 text-sm mt-1">
          {deployments.length} deployment{deployments.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {/* Empty state */}
      {deployments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-5xl mb-4">📋</span>
          <p className="text-gray-400 text-lg">No deployment history</p>
          <p className="text-gray-600 text-sm mt-1">
            Completed deployments will appear here.
          </p>
        </div>
      ) : (
        /* History table */
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3">Build ID</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Safety</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Deployed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {deployments.map((dep) => (
                <tr
                  key={dep.id}
                  className="hover:bg-gray-800/40 transition-colors"
                >
                  {/* Build ID — links to detail page */}
                  <td className="px-5 py-3">
                    <Link
                      to={`/deployment/${dep.id}`}
                      className="font-mono text-blue-400 hover:text-blue-300"
                    >
                      {dep.buildId}
                    </Link>
                  </td>

                  {/* Branch */}
                  <td className="px-5 py-3 text-gray-300">{dep.branch}</td>

                  {/* Status badge */}
                  <td className="px-5 py-3">
                    <StatusBadge status={dep.status} />
                  </td>

                  {/* Safety label */}
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium ${
                        SAFETY_COLORS[dep.safetyLabel] || 'text-gray-400'
                      }`}
                    >
                      {dep.safetyLabel}
                    </span>
                  </td>

                  {/* Created date */}
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                    {formatDate(dep.createdAt)}
                  </td>

                  {/* Deployed date */}
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                    {formatDate(dep.deployedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;

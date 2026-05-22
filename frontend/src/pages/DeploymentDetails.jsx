import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

/**
 * DeploymentDetails — full detail view for a single deployment.
 * Shows status, safety label, branch, commit info, change summary,
 * timestamps, and action buttons.
 */

// Safety label colour helpers
const SAFETY_COLORS = {
  Safe: 'bg-green-500/20 text-green-400 border-green-500/30',
  'Needs Review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'High Impact': 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Format a date string to a readable format
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
};

function DeploymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchDeployment = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/deployments/${id}`);
      setDeployment(data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      console.error('Failed to fetch deployment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployment();
  }, [id]);

  // ---- Action handlers ----
  const handleApprove = async () => {
    await axios.put(`/api/deployments/${id}/approve`);
    fetchDeployment();
  };

  const handleReject = async () => {
    await axios.put(`/api/deployments/${id}/reject`);
    fetchDeployment();
  };

  const handleDeploy = async () => {
    await axios.put(`/api/deployments/${id}/deploy`);
    fetchDeployment();
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading deployment…</span>
        </div>
      </div>
    );
  }

  // ---- 404 state ----
  if (notFound || !deployment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-gray-400 text-lg">Deployment not found</p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const {
    buildId,
    branch,
    commitSha,
    commitMessage,
    status,
    safetyLabel,
    changedFiles,
    changedFilesCount,
    dockerfileChanged,
    configFilesChanged,
    createdAt,
    updatedAt,
    deployedAt,
  } = deployment;

  const safetyStyle =
    SAFETY_COLORS[safetyLabel] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        {/* Top section — Build ID, status, safety label */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl text-white font-semibold">{buildId}</h1>
          <StatusBadge status={status} />
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${safetyStyle}`}
          >
            {safetyLabel}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Branch */}
          <DetailRow label="Branch" value={branch} icon="🔀" />

          {/* Commit SHA */}
          <DetailRow
            label="Commit SHA"
            value={
              <span className="font-mono text-blue-400">
                {commitSha || '—'}
              </span>
            }
            icon="🔗"
          />

          {/* Commit message */}
          <div className="md:col-span-2">
            <DetailRow label="Commit Message" value={commitMessage} icon="💬" />
          </div>
        </div>

        {/* Change Summary */}
        <div className="border-t border-gray-800 pt-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Change Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Total changed files */}
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {changedFilesCount ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Changed Files</p>
            </div>

            {/* Dockerfile changed */}
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">
                {dockerfileChanged ? (
                  <span className="text-yellow-400">Yes</span>
                ) : (
                  <span className="text-green-400">No</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Dockerfile Changed</p>
            </div>

            {/* Config files changed */}
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">
                {configFilesChanged ? (
                  <span className="text-yellow-400">Yes</span>
                ) : (
                  <span className="text-green-400">No</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Config Files Changed</p>
            </div>
          </div>

          {/* List of changed files */}
          {changedFiles && changedFiles.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Changed Files
              </h3>
              <div className="bg-gray-950 rounded-lg border border-gray-800 max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-800/50">
                  {changedFiles.map((file, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 text-sm font-mono text-gray-300 hover:bg-gray-800/30"
                    >
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="border-t border-gray-800 pt-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Timestamps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TimestampRow label="Created" value={formatDate(createdAt)} />
            <TimestampRow label="Updated" value={formatDate(updatedAt)} />
            <TimestampRow label="Deployed" value={formatDate(deployedAt)} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-800 pt-5 flex gap-3">
          {status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors cursor-pointer"
              >
                ✓ Approve
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
              >
                ✕ Reject
              </button>
            </>
          )}
          {status === 'approved' && (
            <button
              onClick={handleDeploy}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              🚀 Deploy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Helper sub-components ---- */

function DetailRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-200 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function TimestampRow({ label, value }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-300 mt-1 font-mono">{value}</p>
    </div>
  );
}

export default DeploymentDetails;

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

/**
 * DeploymentCard — displays a single deployment as a dark-themed card.
 *
 * Props:
 *   deployment  — deployment data object
 *   onApprove   — callback(id) to approve
 *   onReject    — callback(id) to reject
 *   onDeploy    — callback(id) to deploy
 */

// Map safety labels to colour styles
const SAFETY_COLORS = {
  Safe: 'bg-green-500/20 text-green-400 border-green-500/30',
  'Needs Review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'High Impact': 'bg-red-500/20 text-red-400 border-red-500/30',
};

function DeploymentCard({ deployment, onApprove, onReject, onDeploy }) {
  const {
    id,
    buildId,
    branch,
    commitMessage,
    status,
    safetyLabel,
    changedFilesCount,
  } = deployment;

  const safetyStyle =
    SAFETY_COLORS[safetyLabel] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:bg-gray-800/60 transition-colors flex flex-col gap-3">
      {/* Header — Build ID + Status */}
      <div className="flex items-center justify-between">
        <Link
          to={`/deployment/${id}`}
          className="font-mono text-sm text-blue-400 hover:text-blue-300 truncate max-w-[60%]"
          title={buildId}
        >
          {buildId}
        </Link>
        <StatusBadge status={status} />
      </div>

      {/* Branch */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <span role="img" aria-label="branch">🔀</span>
        <span className="truncate">{branch}</span>
      </div>

      {/* Commit message */}
      <p className="text-sm text-gray-300 truncate" title={commitMessage}>
        {commitMessage}
      </p>

      {/* Stats row — changed files + safety label */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500">
          📁 {changedFilesCount ?? 0} file
          {changedFilesCount !== 1 ? 's' : ''} changed
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${safetyStyle}`}
        >
          {safetyLabel}
        </span>
      </div>

      {/* Footer — Action buttons */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-800">
        {status === 'pending' && (
          <Link
            to={`/deployment/${id}`}
            className="flex-1 text-center px-3 py-1.5 text-sm font-medium rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white transition-colors"
          >
            Review Details
          </Link>
        )}

        {(status === 'approved' || status === 'rejected' || status === 'deployed') && (
          <Link
            to={`/deployment/${id}`}
            className="flex-1 text-center px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}

export default DeploymentCard;

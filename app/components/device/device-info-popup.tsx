/**
 * Device info popup — shows device details when a placement is clicked on the map.
 * Displays specs from the Core Definition + placement metadata.
 */

import { CATEGORY_CONFIG } from 'app/lib/core-api';
import type { CorePlacement, CoreDefinition } from 'app/lib/core-api/types';
import { updatePlacement, deletePlacement } from 'app/lib/core-api';

interface DeviceInfoPopupProps {
  placement: CorePlacement;
  definition?: CoreDefinition;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (placement: CorePlacement) => void;
}

export function DeviceInfoPopup({
  placement,
  definition,
  onClose,
  onDelete,
  onUpdate
}: DeviceInfoPopupProps) {
  const category = definition?.device_type || placement.placement_type || 'sensor';
  const config = CATEGORY_CONFIG[category] || {
    label: category,
    color: '#6B7280',
    icon: '?'
  };

  const handleDelete = async () => {
    if (!confirm('Delete this placement?')) return;
    try {
      await deletePlacement(placement.id);
      onDelete?.(placement.id);
    } catch (err) {
      console.error('Failed to delete placement:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-72 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: config.color }}
          >
            {config.icon}
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            {placement.label}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2 text-xs">
        {/* Status */}
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${
              placement.status === 'active'
                ? 'bg-green-100 text-green-700'
                : placement.status === 'provisioned'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
            }`}
          >
            {placement.status}
          </span>
        </div>

        {/* Type */}
        <div className="flex justify-between">
          <span className="text-gray-500">Type</span>
          <span className="text-gray-900">{config.label}</span>
        </div>

        {/* Coordinates */}
        {placement.latitude != null && placement.longitude != null && (
          <div className="flex justify-between">
            <span className="text-gray-500">Coordinates</span>
            <span className="text-gray-900 font-mono">
              {placement.latitude.toFixed(6)}, {placement.longitude.toFixed(6)}
            </span>
          </div>
        )}

        {/* Floor */}
        {placement.floor !== 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Floor</span>
            <span className="text-gray-900">{placement.floor}</span>
          </div>
        )}

        {/* Definition info */}
        {definition && (
          <>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <p className="text-gray-500 mb-1">Definition</p>
              <p className="text-gray-900 font-medium">{definition.name}</p>
              {definition.connectivity && (
                <p className="text-gray-500 mt-0.5">
                  {definition.connectivity} · {definition.protocol}
                </p>
              )}
            </div>
          </>
        )}

        {/* Description */}
        {placement.description && (
          <div className="border-t border-gray-100 pt-2">
            <p className="text-gray-500">{placement.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex justify-end gap-2">
        <button
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1
                     rounded hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

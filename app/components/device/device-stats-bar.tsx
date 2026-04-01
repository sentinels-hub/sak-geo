/**
 * Device stats bar — shows placement counts by category.
 * Tracks placed vs total from scope.
 */

import { useAtomValue } from 'jotai';
import { placementsAtom } from 'state/core';
import { CATEGORY_CONFIG } from 'app/lib/core-api';

export function DeviceStatsBar() {
  const placements = useAtomValue(placementsAtom);

  if (placements.length === 0) return null;

  // Count by placement_type
  const counts = new Map<string, number>();
  for (const p of placements) {
    const type = p.placement_type || 'sensor';
    counts.set(type, (counts.get(type) || 0) + 1);
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-gray-200 text-xs">
      <span className="text-gray-500 font-medium">Devices:</span>
      <span className="text-gray-900 font-semibold">{placements.length}</span>
      <span className="text-gray-300">|</span>
      {[...counts.entries()].map(([type, count]) => {
        const config = CATEGORY_CONFIG[type] || {
          label: type,
          color: '#6B7280',
          icon: '?'
        };
        return (
          <span key={type} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-gray-600">
              {count} {config.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

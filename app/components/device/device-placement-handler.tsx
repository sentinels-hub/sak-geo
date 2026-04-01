/**
 * Device placement handler — click-to-place devices from catalog onto the map.
 *
 * When a device definition is selected from the catalog, the user clicks
 * on the map to place it. This creates a Placement in Core API and adds
 * the feature to the local featureMap.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atom } from 'jotai';
import { createPlacement, CATEGORY_CONFIG } from 'app/lib/core-api';
import type { CoreDefinition } from 'app/lib/core-api/types';
import { currentSiteAtom, placementsAtom } from 'state/core';

/** The currently selected definition for placement mode. null = not in placement mode. */
export const placementModeAtom = atom<CoreDefinition | null>(null);

/** Placement mode status message. */
export const placementStatusAtom = atom<string | null>(null);

/**
 * Hook: returns a function that creates a placement at given coordinates.
 * Call this from the map click handler when in placement mode.
 */
export function usePlaceDevice() {
  const [selectedDef, setSelectedDef] = useAtom(placementModeAtom);
  const currentSite = useAtomValue(currentSiteAtom);
  const setStatus = useSetAtom(placementStatusAtom);
  const [placements, setPlacements] = useAtom(placementsAtom);

  const placeDevice = useCallback(
    async (lng: number, lat: number) => {
      if (!selectedDef || !currentSite) return null;

      setStatus('Placing device...');

      try {
        const placement = await createPlacement({
          site: currentSite.id,
          planned_def: selectedDef.id,
          label: `${selectedDef.name} #${placements.length + 1}`,
          latitude: lat,
          longitude: lng
        });

        setPlacements((prev) => [...prev, placement]);
        setStatus(`Placed: ${placement.label}`);

        // Auto-clear status after 2s
        setTimeout(() => setStatus(null), 2000);

        return placement;
      } catch (err: any) {
        setStatus(`Failed: ${err.message}`);
        setTimeout(() => setStatus(null), 3000);
        return null;
      }
    },
    [selectedDef, currentSite, placements.length, setPlacements, setStatus]
  );

  return { placeDevice, selectedDef, setSelectedDef };
}

/**
 * Placement mode indicator — shows what device is being placed.
 */
export function PlacementModeBar() {
  const [selectedDef, setSelectedDef] = useAtom(placementModeAtom);
  const status = useAtomValue(placementStatusAtom);

  if (!selectedDef) return null;

  const category = selectedDef.device_type || 'sensor';
  const config = CATEGORY_CONFIG[category] || {
    label: category,
    color: '#6B7280',
    icon: '?'
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: config.color }}
        >
          {config.icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Placing: {selectedDef.name}
          </p>
          {status && (
            <p className="text-xs text-gray-500">{status}</p>
          )}
          {!status && (
            <p className="text-xs text-gray-400">Click on the map to place</p>
          )}
        </div>
        <button
          onClick={() => setSelectedDef(null)}
          className="ml-2 text-xs text-gray-400 hover:text-red-500 px-2 py-1
                     rounded hover:bg-red-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

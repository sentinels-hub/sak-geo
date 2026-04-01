/**
 * Placements service — fetch and update device placements from Sentinels Core API.
 * Converts placements to GeoJSON Point features for map display.
 */

import { coreApiFetch } from './client';
import type { CorePlacement, PaginatedResponse } from './types';
import type { Feature, FeatureCollection } from 'geojson';

/**
 * List placements for a site.
 */
export async function listPlacements(siteId: string): Promise<CorePlacement[]> {
  const response = await coreApiFetch<PaginatedResponse<CorePlacement>>(
    `/projects/placements/?site=${siteId}&page_size=500`
  );
  return response.data.results;
}

/**
 * Create a new placement.
 */
export async function createPlacement(
  data: Pick<CorePlacement, 'site' | 'planned_def' | 'label' | 'latitude' | 'longitude'> &
    Partial<CorePlacement>
): Promise<CorePlacement> {
  const response = await coreApiFetch<{ status: string; data: CorePlacement }>(
    '/projects/placements/',
    { method: 'POST', body: data }
  );
  return response.data;
}

/**
 * Update a placement's coordinates or properties.
 */
export async function updatePlacement(
  placementId: string,
  data: Partial<Pick<CorePlacement, 'latitude' | 'longitude' | 'altitude' | 'properties' | 'label'>>
): Promise<CorePlacement> {
  const response = await coreApiFetch<{ status: string; data: CorePlacement }>(
    `/projects/placements/${placementId}/`,
    { method: 'PATCH', body: data }
  );
  return response.data;
}

/**
 * Delete a placement.
 */
export async function deletePlacement(placementId: string): Promise<void> {
  await coreApiFetch(`/projects/placements/${placementId}/`, {
    method: 'DELETE'
  });
}

/**
 * Convert Core placements to a GeoJSON FeatureCollection.
 * Each placement with coordinates becomes a Point feature.
 */
export function placementsToGeoJSON(placements: CorePlacement[]): FeatureCollection {
  const features: Feature[] = [];

  for (const p of placements) {
    if (p.latitude != null && p.longitude != null) {
      features.push({
        type: 'Feature',
        id: p.id,
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude]
        },
        properties: {
          _sak_type: 'placement',
          _sak_id: p.id,
          _sak_site: p.site,
          _sak_def: p.planned_def,
          label: p.label,
          description: p.description,
          placement_type: p.placement_type,
          status: p.status,
          floor: p.floor,
          ...p.properties
        }
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

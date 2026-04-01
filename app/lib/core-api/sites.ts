/**
 * Sites service — fetch and update sites from Sentinels Core API.
 * Converts Core sites to GeoJSON for map display.
 */

import { coreApiFetch } from './client';
import type { CoreSite, PaginatedResponse } from './types';
import type { Feature, FeatureCollection } from 'geojson';

/**
 * List sites for a project.
 */
export async function listSites(projectId: string): Promise<CoreSite[]> {
  const response = await coreApiFetch<PaginatedResponse<CoreSite>>(
    `/projects/sites/?project=${projectId}&page_size=200`
  );
  return response.data.results;
}

/**
 * Update a site's geometry/coordinates.
 */
export async function updateSite(
  siteId: string,
  data: Partial<Pick<CoreSite, 'latitude' | 'longitude' | 'altitude' | 'boundary_geojson'>>
): Promise<CoreSite> {
  const response = await coreApiFetch<{ status: string; data: CoreSite }>(
    `/projects/sites/${siteId}/`,
    { method: 'PATCH', body: data }
  );
  return response.data;
}

/**
 * Convert Core sites to a GeoJSON FeatureCollection.
 * Sites with coordinates become Point features.
 * Sites with boundary_geojson use that geometry.
 */
export function sitesToGeoJSON(sites: CoreSite[]): FeatureCollection {
  const features: Feature[] = [];

  for (const site of sites) {
    // Prefer boundary_geojson if available
    if (site.boundary_geojson && typeof site.boundary_geojson === 'object') {
      features.push({
        type: 'Feature',
        id: site.id,
        geometry: site.boundary_geojson as Feature['geometry'],
        properties: {
          _sak_type: 'site',
          _sak_id: site.id,
          name: site.name,
          code: site.code,
          site_type: site.site_type,
          status: site.status,
          address: site.address
        }
      });
    } else if (site.latitude != null && site.longitude != null) {
      features.push({
        type: 'Feature',
        id: site.id,
        geometry: {
          type: 'Point',
          coordinates: [site.longitude, site.latitude]
        },
        properties: {
          _sak_type: 'site',
          _sak_id: site.id,
          name: site.name,
          code: site.code,
          site_type: site.site_type,
          status: site.status,
          address: site.address
        }
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

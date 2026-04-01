/**
 * Catalog service — fetch device catalog and definitions from Sentinels Core API.
 */

import { coreApiFetch } from './client';
import type {
  CoreCatalogItem,
  CoreDefinition,
  PaginatedResponse
} from './types';

/**
 * List catalog items, optionally filtered by category.
 */
export async function listCatalogItems(
  category?: string
): Promise<CoreCatalogItem[]> {
  const params = new URLSearchParams({ page_size: '200', is_active: 'true' });
  if (category) params.set('category', category);

  const response = await coreApiFetch<PaginatedResponse<CoreCatalogItem>>(
    `/catalog/items/?${params}`
  );
  return response.data.results;
}

/**
 * List definitions, optionally filtered by catalog item.
 */
export async function listDefinitions(
  catalogItemId?: string
): Promise<CoreDefinition[]> {
  const params = new URLSearchParams({ page_size: '200', is_active: 'true' });
  if (catalogItemId) params.set('catalog_item', catalogItemId);

  const response = await coreApiFetch<PaginatedResponse<CoreDefinition>>(
    `/definitions/definitions/?${params}`
  );
  return response.data.results;
}

/**
 * Get a single definition by ID.
 */
export async function getDefinition(id: string): Promise<CoreDefinition> {
  const response = await coreApiFetch<{ status: string; data: CoreDefinition }>(
    `/definitions/definitions/${id}/`
  );
  return response.data;
}

/**
 * Category display config for device icons on the map.
 */
export const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  sensor: { label: 'Sensor', color: '#10B981', icon: 'S' },
  gateway: { label: 'Gateway', color: '#6366F1', icon: 'G' },
  controller: { label: 'Controller', color: '#F59E0B', icon: 'C' },
  actuator: { label: 'Actuator', color: '#EF4444', icon: 'A' },
  camera: { label: 'Camera', color: '#8B5CF6', icon: 'V' },
  meter: { label: 'Meter', color: '#06B6D4', icon: 'M' },
  beacon: { label: 'Beacon', color: '#EC4899', icon: 'B' },
  repeater: { label: 'Repeater', color: '#78716C', icon: 'R' }
};

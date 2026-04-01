/**
 * Sentinels Core API client — public API surface.
 */

export { coreApiFetch, getCoreApiUrl, CoreApiError } from './client';
export { login, logout, refreshToken, getCurrentUser } from './auth';
export { listProjects, getProject } from './projects';
export { listSites, updateSite, sitesToGeoJSON } from './sites';
export {
  listPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement,
  placementsToGeoJSON
} from './placements';
export {
  listCatalogItems,
  listDefinitions,
  getDefinition,
  CATEGORY_CONFIG
} from './catalog';
export type * from './types';

/**
 * Projects service — fetch projects from Sentinels Core API.
 */

import { coreApiFetch } from './client';
import type { CoreProject, PaginatedResponse } from './types';

/**
 * List active projects from Core API.
 */
export async function listProjects(): Promise<CoreProject[]> {
  const response = await coreApiFetch<PaginatedResponse<CoreProject>>(
    '/projects/projects/?status=active&page_size=100'
  );
  return response.data.results;
}

/**
 * Get a single project by ID.
 */
export async function getProject(id: string): Promise<CoreProject> {
  const response = await coreApiFetch<{ status: string; data: CoreProject }>(
    `/projects/projects/${id}/`
  );
  return response.data;
}

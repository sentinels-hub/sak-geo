/**
 * TypeScript types mirroring Sentinels Core API responses.
 * These are the shapes returned by the Core REST API.
 */

// ── Pagination envelope ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  status: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  };
  meta?: Record<string, unknown>;
}

export interface EnvelopeResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// ── Projects ─────────────────────────────────────────────────────────────────

export interface CoreProject {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  project_type: string;
  client_name: string;
  created_at: string;
  updated_at: string;
}

// ── Sites ────────────────────────────────────────────────────────────────────

export interface CoreSite {
  id: string;
  project: string;
  name: string;
  code: string;
  description: string;
  site_type: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  boundary_geojson: Record<string, unknown> | null;
  timezone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Placements ───────────────────────────────────────────────────────────────

export interface CorePlacement {
  id: string;
  site: string;
  planned_def: string | null;
  label: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  floor: number;
  placement_type: string;
  status: string;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Catalog ──────────────────────────────────────────────────────────────────

export interface CoreCatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  manufacturer: string;
  description: string;
  specifications: Record<string, unknown>;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Definitions ──────────────────────────────────────────────────────────────

export interface CoreDefinition {
  id: string;
  catalog_item: string;
  name: string;
  version: string;
  device_type: string;
  connectivity: string;
  protocol: string;
  properties_schema: Record<string, unknown>;
  default_properties: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Scope ────────────────────────────────────────────────────────────────────

export interface CoreScope {
  id: string;
  project: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CoreScopeLine {
  id: string;
  scope: string;
  definition: string;
  quantity: number;
  unit_cost: number;
  notes: string;
}

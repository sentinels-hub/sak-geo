/**
 * Device marker generation — creates SVG data URLs for map markers.
 * Each device category gets a distinct colored marker.
 */

import { CATEGORY_CONFIG } from 'app/lib/core-api';

/**
 * Generate an SVG marker for a device category.
 * Returns a data URL suitable for Mapbox GL image sources.
 */
export function createDeviceMarkerSVG(
  category: string,
  size: number = 32
): string {
  const config = CATEGORY_CONFIG[category] || {
    label: category,
    color: '#6B7280',
    icon: '?'
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${config.color}" stroke="white" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 5}" font-family="Inter,sans-serif" font-size="14" font-weight="700" fill="white" text-anchor="middle">${config.icon}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Generate all category markers.
 */
export function getAllCategoryMarkers(): Map<string, string> {
  const markers = new Map<string, string>();
  for (const category of Object.keys(CATEGORY_CONFIG)) {
    markers.set(category, createDeviceMarkerSVG(category));
  }
  return markers;
}

/**
 * Get the marker color for a GeoJSON feature based on its _sak_type property.
 */
export function getFeatureColor(properties: Record<string, unknown> | null): string {
  if (!properties) return '#6B7280';

  const type = properties['_sak_type'] as string;
  if (type === 'site') return '#1A56DB'; // Sentinels blue for sites

  const placementType = (properties['placement_type'] as string) || 'sensor';
  return CATEGORY_CONFIG[placementType]?.color || '#6B7280';
}

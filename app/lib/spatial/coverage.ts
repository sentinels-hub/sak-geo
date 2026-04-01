/**
 * Coverage analysis utilities.
 *
 * - Generate coverage circles for gateways
 * - Check which sensors are within range of gateways
 * - Generate connectivity lines between gateways and devices
 */

import * as turf from '@turf/helpers';
import turfDistance from '@turf/distance';
import { maxRangeMeters, RF_PRESETS, type FSPLParams } from './fspl';
import type { Feature, FeatureCollection, Point, Polygon } from 'geojson';

/**
 * Generate a coverage circle GeoJSON polygon for a gateway.
 * Uses Turf.js to create a geodesic circle.
 */
export function coverageCircle(
  center: [number, number],
  radiusMeters: number,
  properties?: Record<string, unknown>,
  steps: number = 64
): Feature<Polygon> {
  const [lng, lat] = center;
  const radiusKm = radiusMeters / 1000;

  // Generate circle polygon using angular steps
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 360;
    const point = turf.point([lng, lat]);
    const destination = offsetPoint(lat, lng, radiusKm, angle);
    coords.push(destination);
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    },
    properties: {
      _sak_type: 'coverage',
      radiusM: radiusMeters,
      ...properties
    }
  };
}

/**
 * Calculate a destination point given start, distance and bearing.
 * Uses the Haversine formula.
 */
function offsetPoint(
  lat: number,
  lng: number,
  distanceKm: number,
  bearingDeg: number
): [number, number] {
  const R = 6371; // Earth radius in km
  const d = distanceKm / R;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

/**
 * Find which sensor-type features are within range of a gateway.
 * Returns an array of {gateway, sensor, distanceM} tuples.
 */
export interface ConnectivityLink {
  gatewayId: string;
  sensorId: string;
  distanceM: number;
  signalQuality: 'strong' | 'medium' | 'weak';
}

export function findDevicesInRange(
  gateways: Feature<Point>[],
  sensors: Feature<Point>[],
  rangeMeters: number
): ConnectivityLink[] {
  const links: ConnectivityLink[] = [];

  for (const gw of gateways) {
    const gwCoords = gw.geometry.coordinates as [number, number];

    for (const sensor of sensors) {
      const sensorCoords = sensor.geometry.coordinates as [number, number];
      const dist = turfDistance(
        turf.point(gwCoords),
        turf.point(sensorCoords),
        { units: 'meters' }
      );

      if (dist <= rangeMeters) {
        const ratio = dist / rangeMeters;
        const quality: 'strong' | 'medium' | 'weak' =
          ratio < 0.33 ? 'strong' : ratio < 0.66 ? 'medium' : 'weak';

        links.push({
          gatewayId: String(gw.id || gw.properties?._sak_id),
          sensorId: String(sensor.id || sensor.properties?._sak_id),
          distanceM: Math.round(dist),
          signalQuality: quality
        });
      }
    }
  }

  return links;
}

/**
 * Generate GeoJSON lines for connectivity links.
 */
export function connectivityLinesToGeoJSON(
  links: ConnectivityLink[],
  featureMap: Map<string, Feature<Point>>
): FeatureCollection {
  const features: Feature[] = [];

  for (const link of links) {
    const gw = featureMap.get(link.gatewayId);
    const sensor = featureMap.get(link.sensorId);
    if (!gw || !sensor) continue;

    const color =
      link.signalQuality === 'strong'
        ? '#10B981'
        : link.signalQuality === 'medium'
          ? '#F59E0B'
          : '#EF4444';

    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          gw.geometry.coordinates,
          sensor.geometry.coordinates
        ]
      },
      properties: {
        _sak_type: 'connectivity',
        gatewayId: link.gatewayId,
        sensorId: link.sensorId,
        distanceM: link.distanceM,
        signalQuality: link.signalQuality,
        stroke: color,
        'stroke-width': 1.5,
        'stroke-opacity': 0.6
      }
    });
  }

  return { type: 'FeatureCollection', features };
}

/**
 * Generate coverage overlays for all gateways in a feature collection.
 */
export function generateCoverageOverlays(
  gateways: Feature<Point>[],
  preset: keyof typeof RF_PRESETS = 'lorawan-eu868',
  rxSensitivity: number = -120
): FeatureCollection {
  const rfParams = RF_PRESETS[preset];
  if (!rfParams) {
    return { type: 'FeatureCollection', features: [] };
  }

  const rangeM = maxRangeMeters({ ...rfParams, rxSensitivity });
  const features: Feature[] = [];

  for (const gw of gateways) {
    const center = gw.geometry.coordinates as [number, number];
    const circle = coverageCircle(center, rangeM, {
      gatewayId: String(gw.id || gw.properties?._sak_id),
      preset,
      rangeM,
      fill: '#6366F1',
      'fill-opacity': 0.1,
      stroke: '#6366F1',
      'stroke-opacity': 0.3,
      'stroke-width': 1
    });
    features.push(circle);
  }

  return { type: 'FeatureCollection', features };
}

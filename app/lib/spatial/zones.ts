/**
 * Zone management — compliance zones and rule checking.
 *
 * Zones are polygons drawn on the map with associated rules.
 * Used for ATEX zones, restricted areas, RF exclusion zones, etc.
 */

import turfBooleanPointInPolygon from '@turf/boolean-point-in-polygon';
import * as turf from '@turf/helpers';
import turfDistance from '@turf/distance';
import type { Feature, Point, Polygon } from 'geojson';

// ── Zone types ───────────────────────────────────────────────────────────────

export type ZoneType =
  | 'atex'
  | 'restricted'
  | 'rf_exclusion'
  | 'coverage_required'
  | 'custom';

export interface ZoneRule {
  /** Maximum number of devices allowed in this zone */
  maxDevices?: number;
  /** Minimum separation between devices in meters */
  minSeparationM?: number;
  /** Required device types (at least one of each must be present) */
  requiredTypes?: string[];
  /** Forbidden device types (none of these may be present) */
  forbiddenTypes?: string[];
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  geometry: Feature<Polygon>;
  rules: ZoneRule;
}

// ── Zone colors ──────────────────────────────────────────────────────────────

export const ZONE_COLORS: Record<ZoneType, { fill: string; stroke: string }> = {
  atex: { fill: 'rgba(239, 68, 68, 0.15)', stroke: '#EF4444' },
  restricted: { fill: 'rgba(245, 158, 11, 0.15)', stroke: '#F59E0B' },
  rf_exclusion: { fill: 'rgba(139, 92, 246, 0.15)', stroke: '#8B5CF6' },
  coverage_required: { fill: 'rgba(16, 185, 129, 0.15)', stroke: '#10B981' },
  custom: { fill: 'rgba(107, 114, 128, 0.15)', stroke: '#6B7280' }
};

// ── Zone compliance checking ─────────────────────────────────────────────────

export interface ComplianceViolation {
  zoneId: string;
  zoneName: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Check all devices against all zones for compliance violations.
 */
export function checkZoneCompliance(
  zones: Zone[],
  devices: Feature<Point>[]
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  for (const zone of zones) {
    // Find devices inside this zone
    const devicesInZone = devices.filter((device) =>
      turfBooleanPointInPolygon(device, zone.geometry)
    );

    const { rules } = zone;

    // Max devices check
    if (rules.maxDevices !== undefined && devicesInZone.length > rules.maxDevices) {
      violations.push({
        zoneId: zone.id,
        zoneName: zone.name,
        rule: 'maxDevices',
        message: `Zone "${zone.name}" has ${devicesInZone.length} devices (max: ${rules.maxDevices})`,
        severity: 'error'
      });
    }

    // Forbidden types check
    if (rules.forbiddenTypes?.length) {
      for (const device of devicesInZone) {
        const deviceType = device.properties?.placement_type as string;
        if (rules.forbiddenTypes.includes(deviceType)) {
          violations.push({
            zoneId: zone.id,
            zoneName: zone.name,
            rule: 'forbiddenTypes',
            message: `"${deviceType}" device not allowed in zone "${zone.name}"`,
            severity: 'error'
          });
        }
      }
    }

    // Required types check
    if (rules.requiredTypes?.length) {
      const presentTypes = new Set(
        devicesInZone.map((d) => d.properties?.placement_type as string)
      );
      for (const required of rules.requiredTypes) {
        if (!presentTypes.has(required)) {
          violations.push({
            zoneId: zone.id,
            zoneName: zone.name,
            rule: 'requiredTypes',
            message: `Zone "${zone.name}" requires a "${required}" device`,
            severity: 'warning'
          });
        }
      }
    }

    // Min separation check
    if (rules.minSeparationM !== undefined && devicesInZone.length >= 2) {
      for (let i = 0; i < devicesInZone.length; i++) {
        for (let j = i + 1; j < devicesInZone.length; j++) {
          const dist = turfDistance(
            turf.point(devicesInZone[i].geometry.coordinates),
            turf.point(devicesInZone[j].geometry.coordinates),
            { units: 'meters' }
          );
          if (dist < rules.minSeparationM) {
            violations.push({
              zoneId: zone.id,
              zoneName: zone.name,
              rule: 'minSeparation',
              message: `Devices ${Math.round(dist)}m apart in zone "${zone.name}" (min: ${rules.minSeparationM}m)`,
              severity: 'warning'
            });
          }
        }
      }
    }
  }

  return violations;
}

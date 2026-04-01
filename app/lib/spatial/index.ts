/**
 * Spatial intelligence — public API surface.
 */

export {
  fspl,
  maxRangeMeters,
  signalAtDistance,
  RF_PRESETS,
  type FSPLParams
} from './fspl';

export {
  coverageCircle,
  findDevicesInRange,
  connectivityLinesToGeoJSON,
  generateCoverageOverlays,
  type ConnectivityLink
} from './coverage';

export {
  checkZoneCompliance,
  ZONE_COLORS,
  type Zone,
  type ZoneType,
  type ZoneRule,
  type ComplianceViolation
} from './zones';

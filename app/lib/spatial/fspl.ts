/**
 * Free-Space Path Loss (FSPL) calculator.
 *
 * Calculates theoretical signal attenuation over distance for RF coverage estimation.
 * Used to determine gateway coverage radius on the map.
 *
 * FSPL (dB) = 20·log10(d) + 20·log10(f) + 20·log10(4π/c)
 * Simplified: FSPL (dB) = 20·log10(d_km) + 20·log10(f_MHz) + 32.44
 */

export interface FSPLParams {
  /** Transmit power in dBm */
  txPower: number;
  /** Frequency in MHz */
  frequencyMHz: number;
  /** Antenna gain in dBi (combined TX + RX) */
  antennaGain: number;
  /** Receiver sensitivity in dBm (minimum signal for communication) */
  rxSensitivity: number;
  /** Additional margin in dB (for obstacles, fading, etc.) */
  marginDb?: number;
}

/**
 * Calculate FSPL at a given distance.
 * @param distanceKm Distance in kilometers
 * @param frequencyMHz Frequency in MHz
 * @returns Path loss in dB
 */
export function fspl(distanceKm: number, frequencyMHz: number): number {
  if (distanceKm <= 0 || frequencyMHz <= 0) return 0;
  return 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz) + 32.44;
}

/**
 * Calculate the maximum range in meters for a link budget.
 * Returns the distance at which received signal = rxSensitivity.
 */
export function maxRangeMeters(params: FSPLParams): number {
  const { txPower, frequencyMHz, antennaGain, rxSensitivity, marginDb = 0 } = params;

  // Link budget: Prx = Ptx + Gtx + Grx - FSPL - margin
  // At max range: rxSensitivity = txPower + antennaGain - FSPL - marginDb
  // FSPL = txPower + antennaGain - rxSensitivity - marginDb
  const maxFSPL = txPower + antennaGain - rxSensitivity - marginDb;

  // FSPL = 20·log10(d_km) + 20·log10(f_MHz) + 32.44
  // 20·log10(d_km) = maxFSPL - 20·log10(f_MHz) - 32.44
  // d_km = 10^((maxFSPL - 20·log10(f_MHz) - 32.44) / 20)
  const logD = (maxFSPL - 20 * Math.log10(frequencyMHz) - 32.44) / 20;
  const distanceKm = Math.pow(10, logD);

  return Math.max(0, distanceKm * 1000); // Convert to meters
}

/**
 * Calculate signal strength at a given distance.
 * @returns Received signal in dBm
 */
export function signalAtDistance(
  distanceMeters: number,
  params: Omit<FSPLParams, 'rxSensitivity'>
): number {
  const { txPower, frequencyMHz, antennaGain, marginDb = 0 } = params;
  const distanceKm = distanceMeters / 1000;
  if (distanceKm <= 0) return txPower + antennaGain;

  const pathLoss = fspl(distanceKm, frequencyMHz);
  return txPower + antennaGain - pathLoss - marginDb;
}

/**
 * Common device presets for quick calculations.
 */
export const RF_PRESETS: Record<string, Omit<FSPLParams, 'rxSensitivity'>> = {
  'lorawan-eu868': {
    txPower: 14,
    frequencyMHz: 868,
    antennaGain: 6,
    marginDb: 10
  },
  'lorawan-us915': {
    txPower: 20,
    frequencyMHz: 915,
    antennaGain: 6,
    marginDb: 10
  },
  'wifi-2.4ghz': {
    txPower: 20,
    frequencyMHz: 2400,
    antennaGain: 5,
    marginDb: 15
  },
  'wifi-5ghz': {
    txPower: 20,
    frequencyMHz: 5000,
    antennaGain: 5,
    marginDb: 20
  },
  'zigbee': {
    txPower: 8,
    frequencyMHz: 2400,
    antennaGain: 2,
    marginDb: 10
  },
  'ble': {
    txPower: 4,
    frequencyMHz: 2400,
    antennaGain: 0,
    marginDb: 10
  },
  'lte-cat-m1': {
    txPower: 23,
    frequencyMHz: 700,
    antennaGain: 2,
    marginDb: 15
  }
};

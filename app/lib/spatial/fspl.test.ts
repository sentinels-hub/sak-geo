import { describe, it, expect } from 'vitest';
import { fspl, maxRangeMeters, signalAtDistance, RF_PRESETS } from './fspl';

describe('fspl', () => {
  it('returns 0 for zero distance', () => {
    expect(fspl(0, 868)).toBe(0);
  });

  it('returns 0 for zero frequency', () => {
    expect(fspl(1, 0)).toBe(0);
  });

  it('calculates correct FSPL at 1km 868MHz', () => {
    // FSPL = 20·log10(1) + 20·log10(868) + 32.44
    // = 0 + 58.77 + 32.44 = 91.21 dB
    const result = fspl(1, 868);
    expect(result).toBeCloseTo(91.21, 1);
  });

  it('calculates correct FSPL at 10km 868MHz', () => {
    // 20·log10(10) + 20·log10(868) + 32.44 = 20 + 58.77 + 32.44 = 111.21
    const result = fspl(10, 868);
    expect(result).toBeCloseTo(111.21, 1);
  });

  it('higher frequency = higher loss at same distance', () => {
    const loss868 = fspl(1, 868);
    const loss2400 = fspl(1, 2400);
    expect(loss2400).toBeGreaterThan(loss868);
  });
});

describe('maxRangeMeters', () => {
  it('returns positive range for LoRaWAN EU868', () => {
    const range = maxRangeMeters({
      ...RF_PRESETS['lorawan-eu868'],
      rxSensitivity: -120
    });
    expect(range).toBeGreaterThan(0);
    // LoRaWAN EU868 should have multi-km range in free space
    expect(range).toBeGreaterThan(1000);
  });

  it('BLE has shorter range than LoRaWAN', () => {
    const loraRange = maxRangeMeters({
      ...RF_PRESETS['lorawan-eu868'],
      rxSensitivity: -120
    });
    const bleRange = maxRangeMeters({
      ...RF_PRESETS['ble'],
      rxSensitivity: -90
    });
    expect(bleRange).toBeLessThan(loraRange);
  });
});

describe('signalAtDistance', () => {
  it('signal decreases with distance', () => {
    const params = RF_PRESETS['lorawan-eu868'];
    const signal100m = signalAtDistance(100, params);
    const signal1000m = signalAtDistance(1000, params);
    expect(signal100m).toBeGreaterThan(signal1000m);
  });

  it('returns txPower + gain at zero distance', () => {
    const params = RF_PRESETS['lorawan-eu868'];
    const signal = signalAtDistance(0, params);
    expect(signal).toBe(params.txPower + params.antennaGain);
  });
});

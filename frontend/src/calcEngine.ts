import type { Tank, AllocationRequest, AllocationResult } from './types';

/**
 * Pure-frontend mirror of backend/logic.py calculate_allocation().
 * Runs synchronously so results update instantly on every state change.
 */
export function calculateAllocationFrontend(
  req: AllocationRequest,
  ISO_TANKS: Tank[]
): AllocationResult[] {
  const results: AllocationResult[] = [];

  for (const tank of ISO_TANKS) {
    // Custom tare override
    const currentTare = (req.customTares && req.customTares[tank.id] != null)
      ? req.customTares[tank.id]
      : tank.tare;

    // Custom capacity override
    const currentSize = (req.customCaps && req.customCaps[tank.id] != null)
      ? req.customCaps[tank.id]
      : tank.size;

    const effectiveLimit = Math.min(req.gwLimit, tank.maxGross);
    const netOperationalLimit = effectiveLimit - req.chassisWeight;
    const maxCargoByWeight = netOperationalLimit - currentTare;

    // Baffle bypass
    const actualMinFill = req.isBaffled ? 0 : req.minFill;
    const actualMaxFill = req.isBaffled ? 100 : req.maxFill;

    // MAX side
    const maxVolByFill = currentSize * (actualMaxFill / 100);
    const maxVolByWeight = maxCargoByWeight / req.sg;
    const maxVol = Math.min(maxVolByFill, maxVolByWeight);
    const maxFillPct = (maxVol / currentSize) * 100;
    const maxCargoKg = Math.round(maxVol * req.sg);
    const maxGrossKg = maxCargoKg + currentTare + req.chassisWeight;
    const maxLimitedByWeight = maxVolByWeight < maxVolByFill;

    // MIN side
    const minVol = currentSize * (actualMinFill / 100);
    const minCargoKg = Math.round(minVol * req.sg);
    const minGrossKg = minCargoKg + currentTare + req.chassisWeight;
    const minExceedsLimit = minGrossKg > effectiveLimit;

    const isViable = !minExceedsLimit && maxVol >= minVol;

    const warnings: string[] = [];
    if (minExceedsLimit) {
      warnings.push(`Min fill ${req.minFill}% already exceeds total GVM limit of ${effectiveLimit.toLocaleString()} kg (${minGrossKg.toLocaleString()} kg calculated)`);
    }
    if (maxLimitedByWeight && !minExceedsLimit) {
      warnings.push(`Weight limit caps max fill at ${maxFillPct.toFixed(1)}% — below product max of ${req.maxFill}%`);
    }
    if (req.sg > 1.5) {
      warnings.push('High SG — verify pump, hose & valve pressure ratings');
    }

    const limitingFactor = maxLimitedByWeight
      ? `${effectiveLimit.toLocaleString()} kg gross limit`
      : `${req.maxFill}% max fill`;

    results.push({
      tankId: tank.id,
      tankLabel: tank.label,
      tankNotes: tank.notes,
      isViable,
      isBaffled: req.isBaffled,
      warnings,
      effectiveLimit,
      limitingFactor,
      maxLimitedByWeight,
      minVol: Math.round(minVol),
      minCargoKg,
      minGrossKg,
      minFillPct: actualMinFill,
      maxVol: Math.round(maxVol),
      maxCargoKg,
      maxGrossKg,
      maxFillPct: Math.round(maxFillPct * 10) / 10,
      headroomKg: Math.max(0, effectiveLimit - maxGrossKg),
    });
  }

  return results;
}

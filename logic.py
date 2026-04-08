import math
from typing import List
from models import AllocationRequest, AllocationResult, Tank
from data import ISO_TANKS

def calculate_allocation(req: AllocationRequest) -> List[AllocationResult]:
    results = []
    for tank in ISO_TANKS:
        # Check for custom tare override
        current_tare = tank.tare
        if req.customTares and tank.id in req.customTares:
            current_tare = req.customTares[tank.id]

        # Check for custom capacity override
        current_size = tank.size
        if req.customCaps and tank.id in req.customCaps:
            current_size = req.customCaps[tank.id]

        effective_limit = min(req.gwLimit, tank.maxGross)
        
        # New: Account for chassis/trailer tare weight in the vehicle GVM budget
        net_operational_limit = effective_limit - req.chassisWeight
        max_cargo_by_weight = net_operational_limit - current_tare
        
        # Handle Baffle Tank bypass
        actual_min_fill = 0 if req.isBaffled else req.minFill
        actual_max_fill = 100 if req.isBaffled else req.maxFill
 
        # MAX side
        max_vol_by_fill = current_size * (actual_max_fill / 100)
        max_vol_by_weight = max_cargo_by_weight / req.sg
        max_vol = min(max_vol_by_fill, max_vol_by_weight)
        max_fill_pct = (max_vol / current_size) * 100
        max_cargo_kg = round(max_vol * req.sg)
        max_gross_kg = max_cargo_kg + current_tare + req.chassisWeight # GVM now includes chassis
        max_limited_by_weight = max_vol_by_weight < max_vol_by_fill
 
        # MIN side
        min_vol = current_size * (actual_min_fill / 100)
        min_cargo_kg = round(min_vol * req.sg)
        min_gross_kg = min_cargo_kg + current_tare + req.chassisWeight # GVM now includes chassis
        min_exceeds_limit = min_gross_kg > effective_limit

        is_viable = not min_exceeds_limit and max_vol >= min_vol

        warnings = []
        if min_exceeds_limit:
            warnings.append(f"Min fill {req.minFill}% already exceeds total GVM limit of {effective_limit:,} kg ({min_gross_kg:,} kg calculated)")
        if max_limited_by_weight and not min_exceeds_limit:
            warnings.append(f"Weight limit caps max fill at {max_fill_pct:.1f}% — below product max of {req.maxFill}%")
        if req.sg > 1.5:
            warnings.append("High SG — verify pump, hose & valve pressure ratings")

        limiting_factor = f"{effective_limit:,} kg gross limit" if max_limited_by_weight else f"{req.maxFill}% max fill"

        results.append(AllocationResult(
            tankId=tank.id,
            tankLabel=tank.label,
            tankNotes=tank.notes,
            isViable=is_viable,
            isBaffled=req.isBaffled,
            warnings=warnings,
            effectiveLimit=effective_limit,
            limitingFactor=limiting_factor,
            maxLimitedByWeight=max_limited_by_weight,
            minVol=round(min_vol),
            minCargoKg=min_cargo_kg,
            minGrossKg=min_gross_kg,
            minFillPct=actual_min_fill,
            maxVol=round(max_vol),
            maxCargoKg=max_cargo_kg,
            maxGrossKg=max_gross_kg,
            maxFillPct=round(max_fill_pct, 1),
            headroomKg=max(0, effective_limit - max_gross_kg)
        ))
    return results

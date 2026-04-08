from pydantic import BaseModel
from typing import List, Optional, Dict

class Product(BaseModel):
    name: str
    sg: float
    dg: bool
    un: Optional[str] = ""
    pg: Optional[str] = ""
    cls: Optional[str] = ""
    minFill: int
    maxFill: int

class Country(BaseModel):
    name: str
    kg: int
    note: str

class Tank(BaseModel):
    id: str
    label: str
    size: int
    tare: int
    maxGross: int
    notes: str

class AllocationRequest(BaseModel):
    sg: float
    minFill: int
    maxFill: int
    gwLimit: int
    isDG: bool
    isBaffled: bool = False
    chassisWeight: int = 0
    customTares: Optional[Dict[str, int]] = None
    customCaps: Optional[Dict[str, int]] = None

class AllocationResult(BaseModel):
    tankId: str
    tankLabel: str
    tankNotes: str
    isViable: bool
    isBaffled: bool
    warnings: List[str]
    effectiveLimit: int
    limitingFactor: str
    maxLimitedByWeight: bool
    minVol: int
    minCargoKg: int
    minGrossKg: int
    minFillPct: int
    maxVol: int
    maxCargoKg: int
    maxGrossKg: int
    maxFillPct: float
    headroomKg: int

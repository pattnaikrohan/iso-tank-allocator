export interface Product {
  name: string;
  sg: number;
  dg: boolean;
  un?: string;
  pg?: string;
  cls?: string;
  minFill: number;
  maxFill: number;
}

export interface Country {
  name: string;
  kg: number;
  note: string;
}

export interface Tank {
  id: string;
  label: string;
  size: number;
  tare: number;
  maxGross: number;
  notes: string;
}

export interface AllocationRequest {
  sg: number;
  minFill: number;
  maxFill: number;
  gwLimit: number;
  isDG: boolean;
  isBaffled: boolean;
  chassisWeight: number;
  customTares?: Record<string, number>;
  customCaps?: Record<string, number>;
}

export interface AllocationResult {
  tankId: string;
  tankLabel: string;
  tankNotes: string;
  isViable: boolean;
  isBaffled: boolean;
  warnings: string[];
  effectiveLimit: number;
  limitingFactor: string;
  maxLimitedByWeight: boolean;
  minVol: number;
  minCargoKg: number;
  minGrossKg: number;
  minFillPct: number;
  maxVol: number;
  maxCargoKg: number;
  maxGrossKg: number;
  maxFillPct: number;
  headroomKg: number;
}

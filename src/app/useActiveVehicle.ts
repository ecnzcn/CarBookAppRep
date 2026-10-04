import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { vehicleRepository } from '../repositories/vehicleRepository';
import type { Vehicle } from '../db/types';

const SELECTED_VEHICLE_KEY = 'carbook:selectedVehicleId';

function readStoredSelection(): string | null {
  try {
    return localStorage.getItem(SELECTED_VEHICLE_KEY);
  } catch {
    return null;
  }
}

function storeSelection(id: string) {
  try {
    localStorage.setItem(SELECTED_VEHICLE_KEY, id);
  } catch {
    // Ignore storage failures (private browsing, quota, etc).
  }
}

export interface ActiveVehicle {
  vehicles: Vehicle[] | undefined;
  active: Vehicle | undefined;
  setActiveId: (id: string) => void;
}

export function useActiveVehicle(): ActiveVehicle {
  const vehicles = useLiveQuery(() => vehicleRepository.getAll(), []);
  const [selectedId, setSelectedId] = useState<string | null>(() => readStoredSelection());

  const active = vehicles?.find((v) => v.id === selectedId) ?? vehicles?.[0];

  function setActiveId(id: string) {
    setSelectedId(id);
    storeSelection(id);
  }

  return { vehicles, active, setActiveId };
}

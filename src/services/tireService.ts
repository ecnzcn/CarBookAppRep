import type { TireSetRepository } from '../repositories/tireSetRepository';
import { tireSetRepository } from '../repositories/tireSetRepository';
import type { TireEventRepository } from '../repositories/tireEventRepository';
import { tireEventRepository } from '../repositories/tireEventRepository';
import type { VehicleService } from './vehicleService';
import { vehicleService } from './vehicleService';
import type { TireEvent, TireSet } from '../db/types';
import { generateId } from './id';

export interface TireSetInput {
  vehicleId: string;
  season: TireSet['season'];
  manufacturer?: string;
  model?: string;
  size?: string;
  dot?: string;
  purchaseDate?: string;
  purchaseMileage?: number;
  treadDepth?: number;
  cost?: number;
  notes?: string;
}

export interface TireEventInput {
  tireSetId: string;
  date: string;
  mileage?: number;
  action: TireEvent['action'];
  notes?: string;
}

export class TireValidationError extends Error {}

function assertValidSet(input: TireSetInput) {
  if (!input.vehicleId) {
    throw new TireValidationError('A vehicle is required.');
  }
  if (input.treadDepth !== undefined && input.treadDepth < 0) {
    throw new TireValidationError('Tread depth cannot be negative.');
  }
  if (input.cost !== undefined && input.cost < 0) {
    throw new TireValidationError('Cost cannot be negative.');
  }
}

function assertValidEvent(input: TireEventInput) {
  if (!input.tireSetId) {
    throw new TireValidationError('A tire set is required.');
  }
  if (!input.date) {
    throw new TireValidationError('Date is required.');
  }
}

export function createTireService(
  setRepository: TireSetRepository = tireSetRepository,
  eventRepository: TireEventRepository = tireEventRepository,
  vehicles: VehicleService = vehicleService,
) {
  return {
    sets: {
      async listForVehicle(vehicleId: string): Promise<TireSet[]> {
        return setRepository.getByVehicle(vehicleId);
      },
      async get(id: string): Promise<TireSet | undefined> {
        return setRepository.getById(id);
      },
      async create(input: TireSetInput): Promise<TireSet> {
        assertValidSet(input);
        const set: TireSet = { ...input, id: generateId(), createdAt: new Date().toISOString() };
        await setRepository.add(set);
        return set;
      },
      async update(id: string, input: TireSetInput): Promise<void> {
        assertValidSet(input);
        await setRepository.update(id, input);
      },
      async remove(id: string): Promise<void> {
        const events = await eventRepository.getByTireSet(id);
        await Promise.all(events.map((event) => eventRepository.remove(event.id)));
        await setRepository.remove(id);
      },
    },

    events: {
      async listForSet(tireSetId: string): Promise<TireEvent[]> {
        return eventRepository.getByTireSet(tireSetId);
      },
      async create(input: TireEventInput, vehicleId: string): Promise<TireEvent> {
        assertValidEvent(input);
        const event: TireEvent = { ...input, id: generateId() };
        await eventRepository.add(event);
        if (input.mileage !== undefined) {
          await vehicles.bumpMileageIfHigher(vehicleId, input.mileage);
        }
        return event;
      },
      async remove(id: string): Promise<void> {
        await eventRepository.remove(id);
      },
    },
  };
}

export const tireService = createTireService();

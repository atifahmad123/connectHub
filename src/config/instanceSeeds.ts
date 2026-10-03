import { airUniversity } from '../data/airUniversity';
import { crescentValley } from '../data/crescentValley';
import type { InstanceDataset, InstanceId } from '../types/domain';
export const instanceSeeds: Record<InstanceId, InstanceDataset> = { airUniversity, crescentValley };
export const freshInstances = () => structuredClone(instanceSeeds);

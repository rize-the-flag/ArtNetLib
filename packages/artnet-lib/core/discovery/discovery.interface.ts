import { DISCOVERY_STATUS } from '../constants';
import { valueOf } from '../types';

export type DiscoveryStatus = valueOf<typeof DISCOVERY_STATUS>;

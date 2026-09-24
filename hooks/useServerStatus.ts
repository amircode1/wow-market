import { useQuery } from '@tanstack/react-query';
import { useRegionStore } from '@/store';

export interface ServerStatus {
  region: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: number;
  realmCount?: number;
  auctionHouseOnline: boolean;
}

/**
 * Hook to fetch server status
 */
export function useServerStatus() {
  const { selectedRegion } = useRegionStore();

  return useQuery({
    queryKey: ['serverStatus', selectedRegion],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/blizzard/realms?region=${selectedRegion}`);
        if (!response.ok) throw new Error('Failed to fetch server status');

        const data = await response.json();
        const realms = Array.isArray(data) ? data : [];
        return {
          region: selectedRegion,
          status: realms.length > 0 ? 'online' as const : 'offline' as const,
          lastUpdate: Date.now(),
          realmCount: realms.length,
          auctionHouseOnline: realms.length > 0,
        } as ServerStatus;
      } catch (error) {
        return {
          region: selectedRegion,
          status: 'offline' as const,
          lastUpdate: Date.now(),
          auctionHouseOnline: false,
        } as ServerStatus;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Check every minute
  });
}

'use client';

import { Server } from 'lucide-react';
import { useRealmStore, useRegionStore } from '@/store';
import { useRealms } from '@/hooks/useApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function RealmSelector() {
  const { selectedRegion } = useRegionStore();
  const { selectedRealmByRegion, setSelectedRealm } = useRealmStore();
  const { data: realms, isLoading } = useRealms();

  const selectedRealmId = selectedRealmByRegion[selectedRegion];

  // Normalize realms data to get realm list
  const realmList: Array<{ id: number; name: string }> = (() => {
    if (!realms || !Array.isArray(realms)) return [];
    
    // Handle array of connected realms
    return realms
      .flatMap((connectedRealm: any) => {
        if (Array.isArray(connectedRealm.realms)) {
          return connectedRealm.realms.map((realm: any) => ({
            id: connectedRealm.id,
            name: realm.name,
          }));
        }
        return [];
      })
      .filter((realm) => Boolean(realm.name))
      .filter((realm, index, self) => 
        index === self.findIndex(r => r.id === realm.id)
      );
  })();

  const selectedRealmName = realmList.find(r => r.id === selectedRealmId)?.name || 'Select realm';

  const handleRealmChange = (realmId: string) => {
    setSelectedRealm(selectedRegion, parseInt(realmId, 10));
  };

  return (
    <Select 
      value={selectedRealmId?.toString() || ''} 
      onValueChange={handleRealmChange}
      disabled={isLoading || realmList.length === 0}
    >
      <SelectTrigger className="w-[160px]">
        <Server className="h-4 w-4 mr-2" />
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Select realm'}>
          {selectedRealmName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {realmList.length === 0 && !isLoading && (
          <div className="px-2 py-1.5 text-sm text-text-secondary">No realms available</div>
        )}
        {realmList.map((realm) => (
          <SelectItem key={realm.id} value={realm.id.toString()}>
            {realm.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

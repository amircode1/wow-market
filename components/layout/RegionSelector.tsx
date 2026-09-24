'use client';

import { Globe } from 'lucide-react';
import { useRegionStore } from '@/store';
import { BLIZZARD_CONFIG } from '@/config/blizzard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const REGION_NAMES: Record<string, string> = {
  us: 'Americas',
  eu: 'Europe',
  kr: 'Korea',
  tw: 'Taiwan',
  cn: 'China',
};

export function RegionSelector() {
  const { selectedRegion, setRegion } = useRegionStore();

  return (
    <Select value={selectedRegion} onValueChange={(value) => setRegion(value as any)}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          {REGION_NAMES[selectedRegion] || selectedRegion.toUpperCase()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {BLIZZARD_CONFIG.regions.map((region) => (
          <SelectItem key={region} value={region}>
            {REGION_NAMES[region] || region.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, Users, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealms } from '@/hooks/useApi';
import { useRealmStore, useRegionStore } from '@/store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ConnectedRealm, Realm } from '@/types';

export default function RealmsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: realms, isLoading, error } = useRealms();
  const { selectedRegion } = useRegionStore();
  const { selectedRealmByRegion, setSelectedRealm } = useRealmStore();
  const selectedRealmId = selectedRealmByRegion[selectedRegion] ?? null;

  const filteredRealms = (Array.isArray(realms) ? realms : [])?.filter((realm: ConnectedRealm) => {
    const matchesSearch = realm.realms.some((r: Realm) => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return matchesSearch;
  }) || [];

  const getRealmTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pvp':
        return Shield;
      case 'pve':
        return Users;
      case 'rp':
        return Crown;
      default:
        return Users;
    }
  };

  const getRealmTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pvp':
        return 'text-destructive';
      case 'pve':
        return 'text-success';
      case 'rp':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  const getPopulationColor = (population: string) => {
    switch (population.toLowerCase()) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-surface rounded w-96 mx-auto mb-8"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-surface rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Realms</h1>
          <p className="text-text-secondary mb-8">
            Failed to load realm data. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Select Your Realm</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Choose your World of Warcraft realm to view relevant auction house data. 
          Connected realms share the same auction house.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              type="text"
              placeholder="Search realms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-text-secondary text-center">
          Showing {filteredRealms.length} realm{filteredRealms.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>

      {/* Realms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRealms.map((connectedRealm) => {
          const mainRealm = connectedRealm.realms[0];
          const TypeIcon = getRealmTypeIcon(mainRealm.type.name);
          
          return (
            <Card 
              key={connectedRealm.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedRealmId === connectedRealm.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedRealm(selectedRegion, connectedRealm.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{mainRealm.name}</CardTitle>
                  {selectedRealmId === connectedRealm.id && (
                    <div className="text-primary font-bold">Selected</div>
                  )}
                </div>
                <CardDescription>
                  {connectedRealm.realms.length > 1 
                    ? `Connected Realm (${connectedRealm.realms.length} realms)`
                    : 'Single Realm'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Realm Type */}
                  <div className="flex items-center gap-2">
                    <TypeIcon className={cn("h-4 w-4", getRealmTypeColor(mainRealm.type.name))} />
                    <span className="text-sm">{mainRealm.type.name}</span>
                  </div>

                  {/* Population */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-text-secondary" />
                    <span className={cn("text-sm", getPopulationColor(connectedRealm.population.name))}>
                      {connectedRealm.population.name} Population
                    </span>
                  </div>

                  {/* Region */}
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm">{mainRealm.region.name}</span>
                  </div>

                  {/* Connected Realms */}
                  {connectedRealm.realms.length > 1 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-text-secondary mb-1">Connected Realms:</div>
                      <div className="text-xs">
                        {connectedRealm.realms.slice(1, 4).map((realm, index) => (
                          <span key={realm.id}>
                            {realm.name}
                            {index < Math.min(connectedRealm.realms.length - 1, 3) - 1 && ', '}
                          </span>
                        ))}
                        {connectedRealm.realms.length > 4 && (
                          <span> +{connectedRealm.realms.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRealms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No Realms Found</h3>
          <p className="text-text-secondary mb-6">
            Try adjusting your search query.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
            }}
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Selected Realm Info */}
      {selectedRealmId && (
        <div className="mt-8 p-6 bg-surface rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Selected Realm</h3>
              <p className="text-text-secondary">
                You can now browse items and view auction house data for this realm.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
              <Button asChild>
                <Link href="/items">Browse Items</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextRequest } from 'next/server';
import { BlizzardAPIClient } from '@/lib/blizzard-api';
import { isValidRegion } from '@/config/blizzard';

/**
 * Shared per-region Blizzard API client instances.
 *
 * BUG FIX: Previously a NEW `BlizzardAPIClient` was created for every request.
 * Each new instance had no cached OAuth token, so every single API call
 * triggered a fresh token fetch against Blizzard's OAuth endpoint. That caused
 * slow responses, hammering the auth endpoint, and intermittent 401/429
 * failures. Instances are now cached per region so tokens are reused and only
 * auto-refreshed when they actually expire.
 */
const clients = new Map<string, BlizzardAPIClient>();

export function getBlizzardAPI(request?: NextRequest): BlizzardAPIClient {
  let region = 'us';

  if (request) {
    const { searchParams } = new URL(request.url);
    const regionParam = searchParams.get('region') || 'us';
    region = isValidRegion(regionParam) ? regionParam : 'us';
  }

  let client = clients.get(region);
  if (!client) {
    client = new BlizzardAPIClient(region);
    clients.set(region, client);
  }
  return client;
}


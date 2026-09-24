export const BLIZZARD_CONFIG = {
  regions: ['us', 'eu', 'kr', 'tw', 'cn'] as const,
  defaultRegion: 'us' as const,
  baseUrls: {
    us: 'https://us.api.blizzard.com',
    eu: 'https://eu.api.blizzard.com',
    kr: 'https://kr.api.blizzard.com',
    tw: 'https://tw.api.blizzard.com',
    cn: 'https://gateway.battlenet.com.cn',
  },
  oauthUrls: {
    us: 'https://us.battle.net/oauth/token',
    eu: 'https://eu.battle.net/oauth/token',
    kr: 'https://kr.battle.net/oauth/token',
    tw: 'https://tw.battle.net/oauth/token',
    cn: 'https://www.battlenet.com.cn/oauth/token',
  },
  rateLimits: {
    requestsPerHour: 36000,
    requestsPerSecond: 100,
  },
  cacheDurations: {
    auctionData: 5 * 60 * 1000, // 5 minutes
    itemDetails: 24 * 60 * 60 * 1000, // 24 hours
    realmList: 7 * 24 * 60 * 60 * 1000, // 7 days
    searchResults: 60 * 60 * 1000, // 1 hour
  },
} as const;

export type BlizzardRegion = typeof BLIZZARD_CONFIG.regions[number];

export function getBlizzardConfig(regionOverride?: BlizzardRegion) {
  const envRegion =
    regionOverride ||
    process.env.BLIZZARD_REGION ||
    process.env.NEXT_PUBLIC_BLIZZARD_REGION ||
    'us';
  const region = (envRegion.toLowerCase() as BlizzardRegion) ?? 'us';
  const accessToken = process.env.BLIZZARD_ACCESS_TOKEN || '';
  const clientId = process.env.BLIZZARD_CLIENT_ID || '';
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET || '';

  // فقط در development mode هشدار بده
  if (process.env.NODE_ENV !== 'production') {
    if (!accessToken && (!clientId || !clientSecret)) {
      console.warn('⚠️  Blizzard API: Please configure BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET in your .env.local file for automatic token management.');
      console.warn('   Get your credentials from: https://develop.battle.net/');
    } else if (accessToken && (!clientId || !clientSecret)) {
      console.warn('⚠️  Blizzard API: BLIZZARD_ACCESS_TOKEN is set but client credentials are missing. Token will not auto-refresh when expired.');
    } else if (!accessToken && clientId && clientSecret) {
      console.log('✓ Blizzard API: Using client credentials for automatic token management.');
    }
  }

  return {
    region,
    accessToken,
    baseUrl: BLIZZARD_CONFIG.baseUrls[region],
    oauthUrl: BLIZZARD_CONFIG.oauthUrls[region],
    clientId,
    clientSecret,
  };
}

export function isValidRegion(region: string): region is BlizzardRegion {
  return BLIZZARD_CONFIG.regions.includes(region as BlizzardRegion);
}

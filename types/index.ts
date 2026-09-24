// Realm Types
export interface ConnectedRealm {
  id: number;
  has_queue: boolean;
  status: {
    type: string;
    name: string;
  };
  population: {
    type: string;
    name: string;
  };
  realms: Realm[];
}

export interface Realm {
  id: number;
  name: string;
  slug: string;
  region: {
    name: string;
    id: number;
  };
  category: string;
  locale: string;
  timezone: string;
  type: {
    type: string;
    name: string;
  };
}

// Auction Types
export interface AuctionHouse {
  auctions: Auction[];
}

export interface Auction {
  id: number;
  item: {
    id: number;
    context?: number;
    bonus_lists?: number[];
    modifiers?: Modifier[];
  };
  buyout?: number; // in copper
  quantity: number;
  time_left: 'SHORT' | 'MEDIUM' | 'LONG' | 'VERY_LONG';
  bid?: number;
  unit_price?: number;
}

export interface Modifier {
  type: number;
  value: number;
}

// Item Types
export interface Item {
  id: number;
  name: string;
  quality: {
    type: string;
    name: string;
  };
  level: number;
  required_level: number;
  media: {
    id: number;
  };
  item_class: {
    name: string;
    id: number;
  };
  item_subclass: {
    name: string;
    id: number;
  };
  inventory_type: {
    type: string;
    name: string;
  };
  purchase_price: number; // vendor price
  sell_price: number;
  max_count: number; // stack size
  is_equippable: boolean;
  is_stackable: boolean;
  preview_item?: {
    binding?: {
      type: string;
      name: string;
    };
    armor?: {
      value: number;
      display: {
        display_string: string;
        color: {
          r: number;
          g: number;
          b: number;
          a: number;
        };
      };
    };
    stats?: ItemStat[];
    spells?: ItemSpell[];
    description?: string;
  };
}

export interface ItemStat {
  type: {
    type: string;
    name: string;
  };
  value: number;
  display: {
    display_string: string;
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  };
}

export interface ItemSpell {
  spell: {
    id: number;
    name: string;
  };
  description: string;
}

export interface ItemMedia {
  assets: Array<{
    key: string;
    value: string; // URL to image
  }>;
}

// Recipe Types
export interface Recipe {
  id: number;
  name: string;
  description?: string;
  media?: {
    id: number;
  };
  crafted_item: {
    id: number;
    name: string;
  };
  reagents: Reagent[];
  crafted_quantity: {
    minimum: number;
    maximum?: number;
  };
}

export interface Reagent {
  reagent: {
    id: number;
    name: string;
  };
  quantity: number;
}

// Processed Data Types
export interface PriceSnapshot {
  id?: string; // Optional for database operations
  itemId: number;
  realmId: number;
  timestamp: number;
  minBuyout: number;
  maxBuyout: number;
  avgPrice: number;
  medianPrice: number;
  marketPrice: number; // weighted by quantity
  totalListings: number;
  totalQuantity: number;
  uniqueSellers: number;
  priceStdDev: number;
  listings: Array<{
    price: number;
    quantity: number;
  }>;
}

export interface OHLCV {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  itemId: number;
  addedAt: number;
  notes?: string;
  targetPrice?: number;
  name?: string;
  iconUrl?: string | null;
  quality?: string;
  itemClass?: string;
}

export interface PriceAlert {
  id: string;
  itemId: number;
  realmId: number;
  type: 'above' | 'below' | 'change';
  targetValue: number;
  frequency: 'once' | 'daily' | 'always';
  status: 'active' | 'triggered' | 'expired';
  createdAt: number;
  triggeredAt?: number;
  lastChecked?: number;
}

export interface MarketStats {
  topGainers: Array<{
    itemId: number;
    change24h: number;
    changePercent: number;
  }>;
  topLosers: Array<{
    itemId: number;
    change24h: number;
    changePercent: number;
  }>;
  mostTraded: Array<{
    itemId: number;
    volume24h: number;
    listingCount: number;
  }>;
  trending: Array<{
    itemId: number;
    searchCount: number;
    viewCount: number;
  }>;
}

// API Response Types
export interface BlizzardToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
}

export interface WowTokenPrice {
  price: number;
  last_updated_timestamp: number;
}

export interface SearchResponse<T> {
  results: T[];
  page: number;
  pageSize: number;
  maxPageSize: number;
  pageCount: number;
  resultCountCapped: boolean;
}

// UI State Types
export interface Theme {
  mode: 'dark' | 'light' | 'system';
}

export interface UserSettings {
  selectedRealmId?: number;
  favoriteRealms: number[];
  theme: Theme;
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  compactMode: boolean;
  animationsEnabled: boolean;
  chartSettings: {
    defaultTimeframe: string;
    defaultChartType: string;
    indicators: string[];
  };
  notificationSettings: {
    browserEnabled: boolean;
    soundEnabled: boolean;
    volume: number;
  };
  displaySettings: {
    goldFormat: 'full' | 'compact';
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
}

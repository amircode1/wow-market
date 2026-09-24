---
mode: agent
---

# **Product Requirements Document: WoW Market Tracker**
## **Complete Frontend Application**

## **1. Executive Summary**

### **1.1 Project Name**
WoW Market Tracker - Professional Real-time Auction House Price Tracker

### **1.2 Project Vision**
Create a comprehensive, professional-grade frontend application that displays World of Warcraft Auction House prices in real-time with TradingView-style charts and analytics. The application will fetch data directly from Blizzard's official API and present it in an intuitive, powerful interface for traders and players.

### **1.3 Project Description**
A full-featured Next.js web application that provides real-time auction house price tracking, interactive charts, market analytics, and trading tools. All data is fetched directly from Blizzard Battle.net API with no custom backend required. The application uses client-side state management and browser storage for user preferences and watchlists.

### **1.4 Target Audience**
- Auction house traders and gold makers
- Crafting professionals
- Players optimizing their purchases
- Market analysts
- Content creators covering WoW economy

### **1.5 Core Value Proposition**
Professional-grade market analysis tools similar to TradingView, but specifically designed for WoW's Auction House economy, with no login required and instant access to real-time data.

---

## **2. Technology Stack**

### **2.1 Framework & Core**
- **Framework**: Next.js 14+ (App Router with React Server Components)
- **Language**: TypeScript 5.0+ (strict mode)
- **Runtime**: Node.js 20+ (only for Next.js build/serve)
- **Package Manager**: pnpm or npm

### **2.2 UI & Styling**
- **Styling**: Tailwind CSS 4.0+
- **Component Library**: shadcn/ui (copy-paste components)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Fonts**: Inter (UI) + JetBrains Mono (numbers/codes)

### **2.3 Charts & Visualizations**
- **Primary Charts**: Lightweight Charts (TradingView library)
- **Alternative Charts**: Recharts (for simpler visualizations)
- **Data Viz**: D3.js (for custom visualizations)
- **Color Scales**: Chroma.js

### **2.4 State Management & Data Fetching**
- **Server State**: TanStack Query (React Query) - for API data fetching and caching
- **Client State**: Zustand (for global UI state)
- **Forms**: React Hook Form + Zod validation
- **URL State**: nuqs or next-usequerystate

### **2.5 Data Storage (Client-Side Only)**
- **Browser Storage**: localStorage for user preferences
- **IndexedDB**: Dexie.js (for larger data like price history cache)
- **Session Storage**: For temporary data

### **2.6 External API**
- **Blizzard Battle.net API** (OAuth 2.0 Client Credentials flow)
  - Auction House API
  - Item API
  - Connected Realm API
  - Profession API
  - Search API

### **2.7 Utilities & Helpers**
- **Date/Time**: date-fns or dayjs
- **Numbers**: numeral.js (for formatting gold amounts)
- **Search**: Fuse.js (client-side fuzzy search)
- **Tables**: TanStack Table (React Table v8)
- **Copy to Clipboard**: react-hot-toast + copy-to-clipboard
- **Export**: Papa Parse (CSV export)
- **Math/Stats**: mathjs (for calculations)

### **2.8 Development Tools**
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest + React Testing Library (optional)
- **Bundle Analyzer**: @next/bundle-analyzer

### **2.9 Deployment**
- **Hosting**: Vercel (optimal for Next.js)
- **CDN**: Vercel Edge Network (automatic)
- **Environment**: Serverless Functions for API routes

---

## **3. Application Architecture**

### **3.1 Data Flow**
```
User Interface (React Components)
        ↓
TanStack Query (Data Fetching Layer)
        ↓
Next.js API Routes (Proxy to Blizzard API)
        ↓
Blizzard Battle.net API
        ↓
Cache in Browser (IndexedDB for price history)
        ↓
Display in Charts and Tables
```

### **3.2 Why Next.js API Routes?**
Even though this is a frontend-only app, we need Next.js API routes as a **proxy** to:
1. Hide Blizzard API credentials from client
2. Handle OAuth token management server-side
3. Implement rate limiting
4. Transform/aggregate data before sending to client
5. Cache responses to reduce API calls

### **3.3 Folder Structure**
```
wow-market-tracker/
├── app/
│   ├── page.tsx                    # Homepage (Market Overview)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── items/
│   │   ├── page.tsx               # Browse Items
│   │   └── [itemId]/
│   │       └── page.tsx           # Item Detail Page
│   ├── compare/
│   │   └── page.tsx               # Compare Items
│   ├── calculator/
│   │   └── page.tsx               # Profit Calculator
│   ├── watchlist/
│   │   └── page.tsx               # User Watchlist
│   ├── realms/
│   │   └── page.tsx               # Realm Selection
│   └── api/
│       ├── blizzard/
│       │   ├── token/route.ts     # OAuth token management
│       │   ├── realms/route.ts    # Get realms list
│       │   ├── auctions/
│       │   │   └── [realmId]/route.ts  # Get auction data
│       │   ├── items/
│       │   │   ├── search/route.ts     # Search items
│       │   │   └── [itemId]/route.ts   # Get item details
│       │   └── recipes/
│       │       └── [recipeId]/route.ts # Get recipe details
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── charts/
│   │   ├── PriceChart.tsx         # Main candlestick chart
│   │   ├── VolumeChart.tsx        # Volume bars
│   │   ├── SparklineChart.tsx     # Mini trend chart
│   │   ├── DistributionChart.tsx  # Price distribution
│   │   └── ComparisonChart.tsx    # Multi-item comparison
│   ├── items/
│   │   ├── ItemCard.tsx           # Item display card
│   │   ├── ItemSearch.tsx         # Search component
│   │   ├── ItemList.tsx           # List of items
│   │   ├── ItemTooltip.tsx        # Hover tooltip
│   │   └── ItemFilters.tsx        # Filter sidebar
│   ├── market/
│   │   ├── PriceDisplay.tsx       # Current price display
│   │   ├── PriceStats.tsx         # Price statistics
│   │   ├── MarketDepth.tsx        # Buy/sell depth
│   │   ├── TopGainers.tsx         # Top gaining items
│   │   ├── TopLosers.tsx          # Top losing items
│   │   └── TrendingItems.tsx      # Trending items
│   ├── layout/
│   │   ├── Header.tsx             # Main navigation
│   │   ├── Footer.tsx             # Footer
│   │   ├── Sidebar.tsx            # Sidebar navigation
│   │   └── RealmSwitcher.tsx      # Realm selector
│   ├── calculator/
│   │   ├── CraftingCalculator.tsx
│   │   └── FlipCalculator.tsx
│   └── watchlist/
│       ├── WatchlistTable.tsx
│       └── AddToWatchlist.tsx
├── lib/
│   ├── blizzard-api.ts           # Blizzard API client
│   ├── price-calculator.ts       # Price calculation utilities
│   ├── gold-formatter.ts         # Format gold (g/s/c)
│   ├── chart-utils.ts            # Chart helper functions
│   ├── storage.ts                # LocalStorage/IndexedDB wrapper
│   ├── constants.ts              # App constants
│   └── utils.ts                  # General utilities
├── hooks/
│   ├── useAuctionData.ts         # Fetch auction data
│   ├── useItemSearch.ts          # Search items
│   ├── useItemDetails.ts         # Get item details
│   ├── usePriceHistory.ts        # Fetch/cache price history
│   ├── useRealms.ts              # Get realms list
│   ├── useWatchlist.ts           # Manage watchlist
│   ├── useLocalStorage.ts        # LocalStorage hook
│   └── useIndexedDB.ts           # IndexedDB hook
├── store/
│   ├── realmStore.ts             # Selected realm state
│   ├── watchlistStore.ts         # Watchlist state
│   ├── themeStore.ts             # Theme state
│   └── settingsStore.ts          # User settings
├── types/
│   ├── blizzard-api.ts           # Blizzard API types
│   ├── auction.ts                # Auction data types
│   ├── item.ts                   # Item types
│   ├── realm.ts                  # Realm types
│   └── index.ts                  # Export all types
├── config/
│   └── blizzard.ts               # API configuration
└── public/
    ├── icons/                    # Item quality icons
    └── images/                   # Static images
```

---

## **4. Complete Feature Requirements**

### **FR001: Realm Selection & Management**
**Priority**: Critical

**Description**: Users must select their WoW realm to view relevant auction house data.

**User Stories**:
- As a user, I want to select my realm from a list
- As a user, I want to search for my realm quickly
- As a user, I want to see connected realms grouped together
- As a user, I want my realm selection saved for next visit
- As a user, I want to easily switch between realms
- As a user, I want to see realm information (region, type, population)

**Acceptance Criteria**:
- Display all available realms grouped by region (US, EU, KR, TW, CN)
- Search functionality with autocomplete
- Filter by region
- Show connected realm groupings
- Display realm type (PvP, PvE, RP)
- Save selected realm to localStorage
- Realm switcher in main navigation
- Show realm status (online/offline)
- Default realm selection modal on first visit
- Quick realm favorites

**UI Components**:
- Realm selection modal/page
- Realm search input with autocomplete
- Realm grid/list view
- Realm switcher dropdown in header
- Realm info card

**API Endpoints Needed**:
- `GET /api/blizzard/realms` - List all realms
- `GET /api/blizzard/realms/[id]` - Get realm details

**Data Storage**:
- localStorage: `selectedRealmId`, `favoriteRealms`

---

### **FR002: Item Search & Discovery**
**Priority**: Critical

**Description**: Powerful search system to find items quickly.

**User Stories**:
- As a user, I want to search items by name
- As a user, I want to see search suggestions as I type
- As a user, I want to filter items by category
- As a user, I want to filter by quality, level, expansion
- As a user, I want to see recently searched items
- As a user, I want to discover trending items

**Acceptance Criteria**:
- Search input in main navigation (always visible)
- Instant search results (< 300ms)
- Autocomplete dropdown with item icons
- Search filters:
  - Item quality (Poor, Common, Uncommon, Rare, Epic, Legendary)
  - Item level range (slider)
  - Required level range
  - Item class (Weapon, Armor, Consumable, Trade Goods, etc.)
  - Item subclass
  - Expansion (Classic, TBC, WotLK, etc.)
  - Stackable vs Non-stackable
  - Bind type (BoE, BoP, BoA)
- Fuzzy search support (handle typos)
- Search history (last 20 searches)
- Recent items (last viewed)
- Trending items section
- Popular items section
- Clear search button
- Mobile-optimized search

**UI Components**:
- Search bar with autocomplete
- Search results dropdown
- Advanced filters sidebar
- Search history panel
- Item preview cards
- Filter chips (selected filters)

**API Endpoints Needed**:
- `GET /api/blizzard/items/search?q={query}` - Search items
- `GET /api/blizzard/items/[id]` - Get item details

**Data Storage**:
- localStorage: `searchHistory`, `recentItems`
- IndexedDB: `itemsCache` (cache search results)

---

### **FR003: Real-Time Price Display**
**Priority**: Critical

**Description**: Display current auction house prices with real-time updates.

**User Stories**:
- As a user, I want to see current market prices for items
- As a user, I want to see price statistics (min, max, avg, median)
- As a user, I want to know how many items are listed
- As a user, I want to see price changes from previous periods
- As a user, I want automatic price updates

**Acceptance Criteria**:
- Current price display:
  - Lowest buyout price (highlighted)
  - Average price
  - Median price
  - Highest buyout price
  - Market price (weighted average by quantity)
- Price statistics:
  - Total listings count
  - Total quantity available
  - Unique sellers count
  - Price range (min to max)
  - Standard deviation
- Price changes:
  - Change from 1 hour ago
  - Change from 24 hours ago (% and absolute)
  - Change from 7 days ago
  - Change from 30 days ago
  - Visual indicators (↑↓ arrows, color coding)
- Additional info:
  - Last updated timestamp (relative, e.g., "2 minutes ago")
  - Refresh button (manual refresh)
  - Auto-refresh toggle (every 5 minutes)
  - Loading state
  - Error handling (API down, no data)
- Price formatting:
  - Gold/Silver/Copper display (e.g., 1,234g 56s 78c)
  - Compact format option (1.2k gold)
  - Per-item and per-stack pricing

**UI Components**:
- Price display card
- Price stats grid
- Price change indicators
- Refresh button with animation
- Auto-refresh toggle
- Last updated badge

**API Endpoints Needed**:
- `GET /api/blizzard/auctions/[realmId]` - Get all auction data
- Process auction data client-side to calculate statistics

**Data Storage**:
- IndexedDB: Store price snapshots for history comparison
- localStorage: `autoRefreshEnabled`, `refreshInterval`

**Data Processing**:
```typescript
// Calculate price statistics from auction data
interface PriceStats {
  minBuyout: number;
  maxBuyout: number;
  avgPrice: number;
  medianPrice: number;
  marketPrice: number; // weighted by quantity
  totalListings: number;
  totalQuantity: number;
  uniqueSellers: number;
  priceStdDev: number;
}
```

---

### **FR004: Interactive Price Charts (TradingView Style)**
**Priority**: Critical

**Description**: Professional-grade candlestick charts showing price history and trends.

**User Stories**:
- As a trader, I want to see price history in candlestick format
- As a trader, I want to switch between different timeframes
- As a trader, I want to zoom and pan on the chart
- As a trader, I want to see volume data below price chart
- As a trader, I want moving averages and technical indicators
- As a trader, I want to compare multiple items on one chart

**Acceptance Criteria**:
- Chart types:
  - Candlestick (OHLC - Open, High, Low, Close)
  - Line chart
  - Area chart
  - Bar chart
- Timeframes:
  - 1 Hour (for active items)
  - 6 Hours
  - 12 Hours
  - 1 Day
  - 3 Days
  - 1 Week
  - 2 Weeks
  - 1 Month
  - 3 Months
  - 6 Months
  - 1 Year
  - All Time
- Chart features:
  - Zoom (pinch on mobile, scroll wheel on desktop)
  - Pan (drag chart)
  - Crosshair with price and time tooltip
  - Price scale (logarithmic option)
  - Grid lines (customizable)
  - Legend with current values
  - Full-screen mode
  - Screenshot/export chart as image
  - Share chart (generate link with current view)
- Volume chart below price chart:
  - Volume bars colored by price direction
  - Volume moving average
- Technical indicators (overlays):
  - SMA (Simple Moving Average) - 7, 25, 99 periods
  - EMA (Exponential Moving Average)
  - Bollinger Bands
  - VWAP (Volume Weighted Average Price)
- Price annotations:
  - Horizontal lines (support/resistance)
  - Trend lines
  - Price alerts markers
  - Important events (patches, expansions)
- Chart controls:
  - Timeframe selector
  - Chart type selector
  - Indicators panel
  - Settings (colors, grid, etc.)
  - Auto-scale toggle
  - Percentage scale toggle
- Mobile optimizations:
  - Touch gestures
  - Simplified controls
  - Responsive sizing

**UI Components**:
- Main chart component (Lightweight Charts)
- Chart controls toolbar
- Timeframe selector
- Indicator selector
- Chart settings modal
- Volume chart component
- Legend component
- Crosshair tooltip

**API Endpoints Needed**:
- `GET /api/blizzard/auctions/[realmId]` - Current data
- Historical data stored in IndexedDB from previous fetches

**Data Storage**:
- IndexedDB: `priceHistory` - Store OHLCV data for all timeframes
- localStorage: `chartSettings` (user preferences)

**Data Processing**:
```typescript
// Convert auction snapshots to OHLCV candlesticks
interface Candlestick {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // quantity traded
}

// Aggregate data for different timeframes
function aggregateToTimeframe(
  snapshots: PriceSnapshot[],
  interval: '1h' | '1d' | '1w'
): Candlestick[]
```

---

### **FR005: Item Detail Page**
**Priority**: Critical

**Description**: Comprehensive page showing all information about an item.

**User Stories**:
- As a user, I want to see detailed item information
- As a user, I want to see price history and charts
- As a user, I want to see market statistics
- As a user, I want to see who is selling the item
- As a user, I want to add item to watchlist

**Acceptance Criteria**:
- Item information section:
  - Item icon (high-res)
  - Item name with quality color
  - Item level
  - Required level
  - Item type and subclass
  - Bind type (BoE, BoP, etc.)
  - Unique/stackable
  - Max stack size
  - Vendor sell price
  - Item description/flavor text
  - Item stats (if equipment)
  - Crafted by (if craftable)
  - Socket information
  - Set information
  - Expansion tag
- Current market section:
  - Price display (all statistics from FR003)
  - Add to watchlist button
  - Set price alert button
  - Compare with similar items button
  - Share item button (copy link)
- Price chart section:
  - Interactive price chart (FR004)
  - Chart controls
  - Timeframe selector
- Market depth section:
  - Price distribution histogram
  - Quantity by price level
  - Buy/sell walls visualization
- Sellers section:
  - Table of current listings:
    - Price (per unit and per stack)
    - Quantity
    - Seller name (if available)
    - Time remaining
  - Sort by price, quantity, time
  - Pagination
- Statistics section:
  - Price statistics over different periods
  - Volume statistics
  - Volatility indicator
  - Supply trend (increasing/decreasing)
  - Demand indicator
- Related items section:
  - Similar items (same category)
  - Materials needed (if craftable)
  - Crafts into (if material)
  - Frequently bought together
- Historical data section:
  - Price history table
  - Export historical data (CSV)
  - Date range selector

**UI Components**:
- Item header component
- Item info card
- Item stats card
- Price chart section
- Market depth chart
- Sellers table
- Statistics grid
- Related items carousel
- Action buttons (watchlist, alert, share)

**API Endpoints Needed**:
- `GET /api/blizzard/items/[id]` - Item details
- `GET /api/blizzard/auctions/[realmId]` - Current auctions (filter by item)
- `GET /api/blizzard/recipes/search?output=[itemId]` - Crafting recipes

**Data Storage**:
- IndexedDB: Cache item details and price history
- localStorage: Watchlist items

**Page Route**:
- `/items/[itemId]` or `/items/[itemId]/[itemName]` (SEO-friendly)

---

### **FR006: Market Overview Dashboard (Homepage)**
**Priority**: Critical

**Description**: Homepage displaying market trends and opportunities.

**User Stories**:
- As a user, I want to see overall market trends
- As a user, I want to discover profitable items quickly
- As a user, I want to see trending items
- As a user, I want to see market categories performance

**Acceptance Criteria**:
- Hero section:
  - Selected realm display
  - Quick realm switcher
  - Last market update time
  - Market status indicator
- Top Gainers section:
  - Items with highest price increase (24h)
  - Display: icon, name, current price, % change
  - Minimum 10 items, show more button
  - Sortable (by % change or absolute change)
- Top Losers section:
  - Items with biggest price drops (24h)
  - Same display as gainers
- Most Traded section:
  - Items with highest volume (24h)
  - Display: icon, name, total volume, listings
- Trending Items section:
  - Items with increasing listing velocity
  - Hot items badge
- Price Alerts section (if user has alerts):
  - Show triggered alerts
  - Show items close to alert price
- Watchlist Preview:
  - If user has watchlist, show top 5 items
  - Quick access to full watchlist
- Market Categories:
  - Card for each major category:
    - Consumables
    - Materials/Trade Goods
    - Equipment
    - Recipes
    - Containers
    - Gems
    - Enchants
  - Show: avg price trend, total listings, volume
- Market Heatmap:
  - Visual heatmap of categories by activity
  - Color coding by price change
- Quick Search:
  - Prominent search bar
  - Popular searches suggestions
- Statistics Cards:
  - Total items tracked
  - Total active auctions
  - Market value (sum of all listings)
  - Active sellers

**UI Components**:
- Hero section with realm selector
- Top gainers/losers cards
- Trending items carousel
- Market categories grid
- Heatmap visualization
- Statistics cards
- Quick search bar

**API Endpoints Needed**:
- `GET /api/blizzard/auctions/[realmId]` - All auction data
- Client-side processing to generate statistics

**Data Storage**:
- IndexedDB: Cache processed market data
- localStorage: Last viewed items, favorites

**Data Processing**:
- Calculate price changes from historical data
- Aggregate volumes by item
- Identify trending items (increasing listings)
- Category-level statistics

---

### **FR007: Watchlist Management**
**Priority**: High

**Description**: Users can save items to a watchlist for quick access.

**User Stories**:
- As a user, I want to save my favorite items
- As a user, I want to see prices for all my watchlist items at once
- As a user, I want to organize my watchlist
- As a user, I want to export my watchlist

**Acceptance Criteria**:
- Add to watchlist:
  - Button on item cards
  - Button on item detail page
  - Toast notification on add/remove
  - Indicator when item is in watchlist
- Watchlist page:
  - Table view of all watchlist items:
    - Item icon and name
    - Current price
    - 24h change (% and absolute)
    - Total listings
    - Last updated
    - Actions (view, remove, alert)
  - Bulk actions:
    - Remove selected
    - Add alerts for selected
    - Export selected to CSV
  - Sort by:
    - Name (A-Z, Z-A)
    - Price (low to high, high to low)
    - Change % (biggest gain/loss)
    - Date added (newest first)
  - Filter by:
    - Category
    - Quality
    - Price range
  - Search within watchlist
  - Compact/detailed view toggle
  - Grid view option
- Watchlist widget:
  - Mini watchlist in sidebar
  - Shows top 5 items with price sparklines
  - Quick access to full watchlist
- Watchlist limits:
  - No limit (stored in localStorage)
  - Warning if watchlist gets very large (>100 items)
- Import/Export:
  - Export watchlist as CSV
  - Export watchlist as JSON
  - Import from CSV/JSON
  - Share watchlist (generate shareable link)

**UI Components**:
- Watchlist table
- Add to watchlist button
- Watchlist sidebar widget
- Bulk action toolbar
- Import/export modal

**API Endpoints Needed**:
- None (all client-side with localStorage)

**Data Storage**:
- localStorage: `watchlist` array of item IDs
- IndexedDB: Cache watchlist item details

**Data Structure**:
```typescript
interface WatchlistItem {
  itemId: number;
  addedAt: number; // timestamp
  notes?: string; // user notes
  targetPrice?: number; // optional price goal
}
```

---

### **FR008: Price Alerts**
**Priority**: High

**Description**: Set up alerts for price targets.

**User Stories**:
- As a user, I want to be notified when item reaches target price
- As a user, I want alerts for price drops
- As a user, I want alerts for price increases
- As a user, I want to manage my alerts

**Acceptance Criteria**:
- Create alert:
  - Button on item detail page
  - Button in watchlist
  - Alert configuration:
    - Alert type: Price above, Price below, % change
    - Target price/percentage
    - Alert frequency (once, daily, always)
  - Notification method:
    - Browser notification (with permission)
    - In-app notification
  - Alert name/label (optional)
- Alert checking:
  - Check prices when app is open
  - Background check using service worker
  - Visual indicator when alert triggers
  - Sound notification (optional, with mute)
- Alerts page:
  - List all active alerts
  - Show alert status:
    - Waiting (price not reached)
    - Triggered (price reached)
    - Expired (if one-time and triggered)
  - Table columns:
    - Item icon and name
    - Alert type
    - Target price
    - Current price
    - Distance to target (% or gold)
    - Status
    - Created date
    - Actions (edit, delete, view item)
  - Filter by status
  - Sort by proximity to target
- Alert notifications:
  - Browser push notification
  - In-app notification banner
  - Sound alert (optional)
  - Notification history
  - Mark as read/dismiss
- Alert limits:
  - Reasonable limit (e.g., 50 alerts) stored in localStorage

**UI Components**:
- Create alert modal/form
- Alerts table
- Alert status badge
- Notification toast
- Alert settings panel

**API Endpoints Needed**:
- None (client-side checking)

**Data Storage**:
- localStorage: `priceAlerts` array
- IndexedDB: Alert history

**Data Structure**:
```typescript
interface PriceAlert {
  id: string;
  itemId: number;
  type: 'above' | 'below' | 'change';
  targetValue: number;
  frequency: 'once' | 'daily' | 'always';
  status: 'active' | 'triggered' | 'expired';
  createdAt: number;
  triggeredAt?: number;
  notificationMethod: 'browser' | 'inapp';
}
```

**Alert Checking Logic**:
- Check alerts every time price data is fetched
- Use background service worker for periodic checks
- Request notification permission on first alert creation

---

### **FR009: Item Comparison**
**Priority**: Medium

**Description**: Compare multiple items side-by-side.

**User Stories**:
- As a user, I want to compare prices of similar items
- As a user, I want to see which item is more profitable
- As a user, I want to compare price trends

**Acceptance Criteria**:
- Add items to comparison:
  - From search results
  - From item detail page
  - From watchlist
  - Maximum 4-6 items
- Comparison page:
  - Side-by-side item cards
  - Comparison table:
    - Current price
    - 24h change
    - 7d change
    - Average volume
    - Total listings
    - Price volatility
    - Min/max prices
  - Synchronized price charts:
    - All items on one chart (different colors)
    - Or separate charts with same scale
    - Toggle between views
  - Percentage normalization option:
    - Show all items starting at 100%
    - Compare relative changes
  - Highlight best values (lowest price, highest volume)
  - Remove item from comparison
  - Clear all
- Share comparison:
  - Generate shareable URL with selected items
  - Copy comparison table to clipboard
  - Export as image
- Mobile view:
  - Swipe between items
  - Comparison metrics below

**UI Components**:
- Comparison page layout
- Item comparison cards
- Synchronized charts
- Comparison table
- Add to comparison button

**API Endpoints Needed**:
- Same as item details for each item

**Data Storage**:
- URL query params: `?items=123,456,789`
- sessionStorage: Current comparison items

**Page Route**:
- `/compare?items=[id1,id2,id3]`

---

### **FR010: Profit Calculator**
**Priority**: Medium

**Description**: Calculate potential profits from crafting and trading.

**User Stories**:
- As a crafter, I want to know if crafting is profitable
- As a trader, I want to calculate flip profit margins
- As a user, I want to factor in auction house fees

**Acceptance Criteria**:
- Crafting Calculator:
  - Select item to craft
  - Automatically fetch recipe materials
  - Show material costs (current market price)
  - Calculate total material cost
  - Show current sell price of crafted item
  - Calculate profit:
    - Gross profit (sell - materials)
    - Net profit (after 5% AH cut)
    - Profit per item
    - ROI percentage
  - Input quantity to craft
  - Show total profit for batch
  - Material availability check
  - Alternative materials (if applicable)
- Flipping Calculator:
  - Input buy price
  - Input sell price
  - Input quantity
  - Calculate:
    - Cost to buy
    - Expected revenue
    - AH fees (5%)
    - Net profit
    - ROI %
    - Break-even price
  - Profit per flip
  - Time to profit (estimated)
- Fees & Costs:
  - Auction house cut (5%)
  - Deposit costs (optional)
  - Custom overhead percentage
- Saved Calculations:
  - Save calculation presets
  - Calculation history
  - Quick recalculate button
- Profitability Ranking:
  - Compare multiple craft/flip options
  - Rank by profit margin
  - Rank by ROI

**UI Components**:
- Calculator page with tabs (Crafting/Flipping)
- Material cost breakdown
- Profit summary card
- Calculator history sidebar
- Comparison table

**API Endpoints Needed**:
- `GET /api/blizzard/recipes/[id]` - Recipe details
- `GET /api/blizzard/items/[id]` - Item prices

**Data Storage**:
- localStorage: `calculatorHistory`, `savedCalculations`

**Page Route**:
- `/calculator`

**Calculation Example**:
```typescript
interface CraftingCalc {
  recipeId: number;
  itemId: number;
  materials: {
    itemId: number;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalMaterialCost: number;
  sellPrice: number;
  ahCut: number; // 5% of sell price
  grossProfit: number; // sell - materials
  netProfit: number; // gross - ahCut
  roi: number; // (netProfit / totalCost) * 100
}
```

---

### **FR011: Advanced Filters & Sorting**
**Priority**: Medium

**Description**: Powerful filtering system for browsing items.

**User Stories**:
- As a user, I want to filter items by multiple criteria
- As a user, I want to find underpriced items
- As a user, I want to save my favorite filters

**Acceptance Criteria**:
- Filter Categories:
  - **Price Filters**:
    - Price range (min-max)
    - Below vendor price
    - Below crafting cost
    - Underpriced (below market average)
  - **Item Attributes**:
    - Quality (Common, Uncommon, Rare, Epic, Legendary)
    - Item level (range slider)
    - Required level (range slider)
    - Bind type (BoE, BoP, BoA)
    - Stackable/Non-stackable
  - **Categories**:
    - Weapons
    - Armor
    - Consumables
    - Trade Goods
    - Recipes
    - Containers
    - Gems
    - Enchants
    - Glyphs
    - Battle Pets
    - Mounts (rare drops)
  - **Market Activity**:
    - High volume (active market)
    - Low volume (rare items)
    - Recently posted (< 1 hour)
    - Expiring soon
    - Single seller (monopoly)
    - Multiple sellers (competitive)
  - **Profitability**:
    - High ROI potential
    - Flip candidates (big spread)
    - Crafting profitable
    - Trending up/down
  - **Expansion**:
    - Classic
    - The Burning Crusade
    - Wrath of the Lich King
    - Cataclysm
    - Mists of Pandaria
    - Warlords of Draenor
    - Legion
    - Battle for Azeroth
    - Shadowlands
    - Dragonflight
- Sort Options:
  - Name (A-Z, Z-A)
  - Price (Low to High, High to Low)
  - Item Level
  - Recently Added
  - Price Change % (24h)
  - Volume (High to Low)
  - Profit Potential
  - Listing Count
- Filter UI:
  - Collapsible filter sidebar
  - Selected filters shown as chips
  - Clear individual filter
  - Clear all filters
  - Filter counter badge
  - Mobile: Filter bottom sheet/modal
- Saved Filters:
  - Save filter combination as preset
  - Quick load presets
  - Manage saved filters
  - Share filter link
- Filter Performance:
  - Client-side filtering (fast)
  - Results count indicator
  - Loading state
  - Empty state with suggestions

**UI Components**:
- Filter sidebar
- Filter chips
- Sort dropdown
- Save filter modal
- Mobile filter sheet

**API Endpoints Needed**:
- All filtering done client-side after fetching auction data

**Data Storage**:
- localStorage: `savedFilters`, `lastUsedFilters`
- URL query params: Shareable filter state

---

### **FR012: Market Analytics Dashboard**
**Priority**: Medium

**Description**: Advanced market analysis and insights.

**User Stories**:
- As a power user, I want deep market insights
- As a trader, I want to identify market trends
- As an analyst, I want market reports

**Acceptance Criteria**:
- Market Overview:
  - Total market value (all listings)
  - Total number of auctions
  - Unique items listed
  - Unique sellers
  - Market activity index
  - Daily volume trend
- Category Analysis:
  - Performance by category (price trend)
  - Volume by category
  - Category market share
  - Category growth rate
  - Interactive category tree map
- Price Distribution:
  - Histogram of all items by price range
  - Identify price clusters
  - Outlier detection
- Volume Analysis:
  - Top items by volume
  - Volume heatmap by time of day
  - Volume trends over time
- Volatility Analysis:
  - Most volatile items
  - Market stability index
  - Price range distributions
- Supply & Demand:
  - Items with low supply, high demand
  - Oversupplied items
  - Supply/demand ratio
  - Stock-out predictions
- Market Efficiency:
  - Spread analysis (bid-ask spread)
  - Price dispersion
  - Market maker opportunities
- Time-based Analysis:
  - Best time to buy/sell
  - Weekly patterns
  - Seasonal trends
  - Patch impact analysis
- Correlation Analysis:
  - Items that move together
  - Material-to-crafted correlations
  - Cross-category effects

**UI Components**:
- Analytics dashboard page
- Interactive charts and graphs
- Statistical cards
- Data tables
- Export reports button

**API Endpoints Needed**:
- All analysis done client-side from cached data

**Data Storage**:
- IndexedDB: Historical data for analysis

**Page Route**:
- `/analytics`

---

### **FR013: Mobile Responsive Design**
**Priority**: Critical

**Description**: Full mobile optimization for on-the-go access.

**User Stories**:
- As a mobile user, I want full access to all features
- As a mobile user, I want touch-optimized controls
- As a mobile user, I want fast loading

**Acceptance Criteria**:
- Responsive breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- Mobile Navigation:
  - Bottom navigation bar (Home, Search, Watchlist, More)
  - Hamburger menu for secondary links
  - Sticky header with search
- Touch Optimizations:
  - Minimum touch target size (44x44px)
  - Swipe gestures for charts
  - Pull-to-refresh
  - Touch-friendly dropdowns
  - Mobile-optimized tables (card view)
- Mobile Charts:
  - Simplified chart controls
  - Touch zoom and pan
  - Landscape mode support
  - Full-screen chart option
- Mobile Forms:
  - Native mobile inputs
  - Mobile-optimized keyboards
  - Auto-complete friendly
- Performance:
  - Code splitting for mobile
  - Lazy loading images
  - Reduced initial bundle
  - Progressive Web App (PWA)
- Offline Support:
  - Service worker for offline viewing
  - Cached data access
  - Offline indicator
- Mobile-specific Features:
  - Install app prompt (PWA)
  - Share sheet integration
  - Notifications support

**Technical Implementation**:
- Tailwind responsive utilities
- Mobile-first CSS approach
- PWA manifest and service worker
- Touch event handlers
- Viewport meta tags
- Mobile performance optimization

---

### **FR014: Dark/Light Theme**
**Priority**: High

**Description**: Theme customization with dark mode as default.

**User Stories**:
- As a user, I want to choose my preferred theme
- As a user, I want themes that reduce eye strain
- As a user, I want my theme choice saved

**Acceptance Criteria**:
- Theme Options:
  - Dark theme (default)
  - Light theme
  - System preference (auto)
- Dark Theme Colors:
  - Background: #0B0E11 (very dark)
  - Surface: #161A1E (dark gray)
  - Card: #1E2329 (lighter gray)
  - Border: #2B3139 (subtle border)
  - Text Primary: #E6E8EA (light gray)
  - Text Secondary: #848E9C (muted gray)
  - Primary: #3861FB (blue)
  - Success: #0ECB81 (green)
  - Danger: #F6465D (red)
  - Warning: #F0B90B (yellow)
- Light Theme Colors:
  - Background: #FFFFFF
  - Surface: #F5F5F5
  - Card: #FFFFFF
  - Border: #E6E6E6
  - Text Primary: #111111
  - Text Secondary: #666666
  - Primary: #3861FB
  - Success: #0ECB81
  - Danger: #F6465D
  - Warning: #F0B90B
- Theme Switcher:
  - Toggle in header
  - Smooth transition animation
  - Icon changes (sun/moon)
  - Keyboard shortcut (Cmd/Ctrl + Shift + D)
- Theme Persistence:
  - Save to localStorage
  - Apply on page load (no flash)
  - Respect system preference if set to "auto"
- Chart Themes:
  - Dark theme for charts
  - Light theme for charts
  - Match app theme automatically

**Technical Implementation**:
- Tailwind dark mode class strategy
- CSS variables for theme colors
- Theme context provider
- useTheme hook
- localStorage persistence
- System preference detection

**Data Storage**:
- localStorage: `theme` ('dark' | 'light' | 'system')

---

### **FR015: Export & Share Features**
**Priority**: Medium

**Description**: Export data and share insights.

**User Stories**:
- As a user, I want to export my data
- As a user, I want to share interesting findings
- As a user, I want to save reports

**Acceptance Criteria**:
- Export Options:
  - **CSV Export**:
    - Price history
    - Watchlist
    - Search results
    - Market reports
  - **JSON Export**:
    - Raw data export
    - API-compatible format
  - **Image Export**:
    - Charts as PNG
    - Screenshots of pages
  - **PDF Export** (optional):
    - Market reports
    - Price analysis
- Share Options:
  - **Copy Link**:
    - Item page links
    - Chart views with state
    - Filter combinations
    - Comparison views
  - **Social Share**:
    - Twitter/X
    - Discord (webhook support)
    - Reddit
  - **Embed Code**:
    - Price widgets
    - Charts
- Share Features:
  - Shareable links with state
  - QR code generation
  - Short URL option
  - Share preview image
  - Open Graph meta tags

**UI Components**:
- Export dropdown menu
- Share modal
- Copy to clipboard button
- Social share buttons
- QR code generator

**Technical Implementation**:
- Papa Parse for CSV generation
- html2canvas for screenshots
- Chart export API
- URL state encoding
- OG meta tags for shares

---

### **FR016: Settings & Preferences**
**Priority**: Medium

**Description**: User customization and preferences.

**User Stories**:
- As a user, I want to customize my experience
- As a user, I want to control notifications
- As a user, I want to manage data usage

**Acceptance Criteria**:
- General Settings:
  - Default realm selection
  - Language (if multi-language)
  - Date format
  - Time format (12h/24h)
  - Number format (gold display)
- Display Settings:
  - Theme (dark/light/auto)
  - Compact mode (denser UI)
  - Animations on/off
  - Chart style preferences
  - Table density
- Data Settings:
  - Auto-refresh interval (1min, 5min, 10min, off)
  - Cache duration
  - Data usage mode (reduce API calls)
  - Clear cache button
  - Export all data
  - Import data
- Notification Settings:
  - Browser notifications on/off
  - Sound alerts on/off
  - Alert volume
  - Notification frequency
- Privacy Settings:
  - Analytics opt-out
  - Cookie preferences
  - Data collection preferences
- Advanced Settings:
  - Developer mode
  - API rate limiting info
  - Debug mode
  - Performance stats
- Reset Options:
  - Reset settings to default
  - Clear all data
  - Reset watchlist
  - Reset alerts

**UI Components**:
- Settings page with sections
- Settings cards
- Toggle switches
- Sliders
- Confirm dialogs for destructive actions

**Data Storage**:
- localStorage: All settings and preferences

**Page Route**:
- `/settings`

---

### **FR017: Search Engine Optimization (SEO)**
**Priority**: High

**Description**: Optimize for search engines and social sharing.

**User Stories**:
- As a content creator, I want my links to preview nicely
- As a user, I want to find items via Google search

**Acceptance Criteria**:
- Meta Tags:
  - Dynamic page titles
  - Meta descriptions
  - Keywords meta tag
  - Canonical URLs
  - Language tags
- Open Graph Tags:
  - og:title
  - og:description
  - og:image (item icons, charts)
  - og:url
  - og:type
  - og:site_name
- Twitter Cards:
  - twitter:card
  - twitter:title
  - twitter:description
  - twitter:image
- Structured Data (JSON-LD):
  - Product schema for items
  - BreadcrumbList
  - Organization
  - WebSite with search action
- Technical SEO:
  - Server-side rendering (SSR) for item pages
  - Semantic HTML
  - Proper heading hierarchy
  - Image alt texts
  - Fast load times
  - Mobile-friendly
  - HTTPS only
- Sitemap:
  - Dynamic sitemap generation
  - Item pages in sitemap
  - Priority and change frequency
- Robots.txt:
  - Allow search engine crawling
  - Specify sitemap location

**Technical Implementation**:
- Next.js metadata API
- Dynamic OG image generation
- SSR for important pages
- Sitemap generation route
- Robots.txt file

---

### **FR018: Performance Optimization**
**Priority**: Critical

**Description**: Ensure fast loading and smooth experience.

**User Stories**:
- As a user, I want pages to load quickly
- As a user, I want smooth interactions
- As a mobile user, I want good performance on slower connections

**Acceptance Criteria**:
- Core Web Vitals Targets:
  - **LCP (Largest Contentful Paint)**: < 2.5s
  - **FID (First Input Delay)**: < 100ms
  - **CLS (Cumulative Layout Shift)**: < 0.1
- Loading Performance:
  - Initial page load < 2s (3G connection)
  - Time to Interactive < 3s
  - First Contentful Paint < 1.5s
- Runtime Performance:
  - Chart rendering at 60 FPS
  - Smooth scrolling
  - No UI freezes
  - Quick interactions (< 100ms response)
- Optimization Techniques:
  - Code splitting (route-based)
  - Lazy loading components
  - Image optimization (Next.js Image)
  - Font optimization
  - Minification and compression
  - Tree shaking
  - Bundle size < 250KB (initial)
  - Critical CSS inlining
  - Preloading critical resources
  - DNS prefetch for APIs
  - Resource hints
- Data Optimization:
  - Efficient API calls
  - Request deduplication
  - Response caching
  - Stale-while-revalidate strategy
  - Pagination for large lists
  - Virtual scrolling for long lists
  - Incremental data loading
- Monitoring:
  - Lighthouse CI integration
  - Real User Monitoring (RUM)
  - Performance budgets
  - Bundle size tracking

**Technical Implementation**:
- Next.js automatic optimizations
- React.memo for expensive components
- useMemo and useCallback
- Web Vitals monitoring
- Bundle analyzer
- Performance profiling

---

### **FR019: Error Handling & Loading States**
**Priority**: High

**Description**: Graceful error handling and user feedback.

**User Stories**:
- As a user, I want to know when something goes wrong
- As a user, I want to understand errors
- As a user, I want clear loading indicators

**Acceptance Criteria**:
- Loading States:
  - Skeleton loaders for content
  - Spinner for actions
  - Progress bars for long operations
  - Loading text (descriptive)
  - Shimmer effects for cards
  - Disable buttons during loading
  - Loading state for each async operation
- Error States:
  - Error boundaries for React errors
  - API error handling
  - Network error detection
  - Timeout handling
  - Rate limit errors
  - 404 not found pages
  - 500 server error pages
  - Custom error messages
  - Error retry button
  - Error reporting (to console/service)
- Error Messages:
  - User-friendly error text
  - Actionable error messages
  - Error codes for debugging
  - Support contact info
  - Toast notifications for errors
  - Modal for critical errors
- Empty States:
  - No results found
  - Empty watchlist
  - No price data
  - Clear call-to-action
  - Helpful suggestions
  - Illustrative graphics
- Offline Handling:
  - Offline indicator banner
  - Cached data notice
  - Retry when online
  - Queue actions for later
- Validation:
  - Form validation errors
  - Input constraints
  - Real-time validation
  - Error highlighting

**Technical Implementation**:
- Error boundary components
- React Query error handling
- Toast notification system (react-hot-toast)
- Skeleton loading components
- Custom error pages
- Network status detection
- Retry logic with exponential backoff

---

### **FR020: Accessibility (A11y)**
**Priority**: High

**Description**: Ensure application is accessible to all users.

**User Stories**:
- As a keyboard user, I want to navigate without a mouse
- As a screen reader user, I want to understand all content
- As a user with vision impairment, I want good contrast

**Acceptance Criteria**:
- Keyboard Navigation:
  - All interactive elements keyboard accessible
  - Logical tab order
  - Visible focus indicators
  - Skip to main content link
  - Keyboard shortcuts (documented)
  - Escape key to close modals
  - Arrow keys for navigation
- Screen Reader Support:
  - Semantic HTML
  - ARIA labels and roles
  - ARIA live regions for dynamic content
  - Alt text for all images
  - Descriptive link text
  - Form labels
  - Error announcements
- Visual Accessibility:
  - WCAG AA contrast ratios (4.5:1 text, 3:1 graphics)
  - Resizable text (up to 200%)
  - No color-only information
  - Focus visible indicators
  - Clear visual hierarchy
- Motion & Animation:
  - Respect prefers-reduced-motion
  - Disable animations option
  - No flashing content
- Forms:
  - Clear labels
  - Error messages associated with fields
  - Required field indicators
  - Helpful placeholder text
- Testing:
  - Lighthouse accessibility score > 95
  - axe-core violations = 0
  - Keyboard navigation test
  - Screen reader testing

**Technical Implementation**:
- Semantic HTML elements
- ARIA attributes where needed
- Focus management
- Skip links
- Testing with accessibility tools
- CSS for focus-visible
- Reduced motion media query

---

## **4. Blizzard API Integration**

### **4.1 Authentication Flow**

**OAuth 2.0 Client Credentials**:
1. Request access token from Blizzard
2. Cache token until expiration
3. Use token for all API requests
4. Refresh token when expired

**Token Endpoint**:
```
POST https://{region}.battle.net/oauth/token
Authorization: Basic {base64(clientId:clientSecret)}
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

**Token Storage**:
- Store token server-side (in API route)
- Not exposed to client
- Implement token refresh logic

### **4.2 API Endpoints to Use**

**Base URL**: `https://{region}.api.blizzard.com`

Regions: `us`, `eu`, `kr`, `tw`, `cn`

**Endpoints**:

1. **Get Connected Realms**
   ```
   GET /data/wow/connected-realm/index
   namespace: dynamic-{region}
   locale: en_US
   ```

2. **Get Connected Realm Details**
   ```
   GET /data/wow/connected-realm/{connectedRealmId}
   namespace: dynamic-{region}
   locale: en_US
   ```

3. **Get Auction House Data**
   ```
   GET /data/wow/connected-realm/{connectedRealmId}/auctions
   namespace: dynamic-{region}
   locale: en_US
   ```
   Returns: Array of all current auctions

4. **Search Items**
   ```
   GET /data/wow/search/item
   namespace: static-{region}
   locale: en_US
   name.en_US: {searchQuery}
   orderby: name
   _page: 1
   ```

5. **Get Item Details**
   ```
   GET /data/wow/item/{itemId}
   namespace: static-{region}
   locale: en_US
   ```

6. **Get Item Media (Icon)**
   ```
   GET /data/wow/media/item/{itemId}
   namespace: static-{region}
   locale: en_US
   ```

7. **Get Recipe Details**
   ```
   GET /data/wow/recipe/{recipeId}
   namespace: static-{region}
   locale: en_US
   ```

8. **Search Recipes**
   ```
   GET /data/wow/search/recipe
   namespace: static-{region}
   locale: en_US
   ```

### **4.3 Rate Limits**

**Blizzard API Rate Limits**:
- 36,000 requests per hour per IP
- 100 requests per second per IP

**Mitigation Strategies**:
1. Implement request caching (5-15 minute cache for auction data)
2. Use batch requests where possible
3. Implement request queuing
4. Show rate limit warnings to users
5. Implement exponential backoff on errors

### **4.4 API Response Caching**

**Cache Strategy**:
- **Auction Data**: Cache for 5-10 minutes (data updates hourly in WoW)
- **Item Details**: Cache for 24 hours (static data)
- **Realm List**: Cache for 1 week (rarely changes)
- **Search Results**: Cache for 1 hour

**Implementation**:
- Use IndexedDB for client-side cache
- Store timestamp with cached data
- Check cache freshness before API call
- Implement stale-while-revalidate pattern

### **4.5 Error Handling**

**Common Errors**:
- 401 Unauthorized: Token expired, refresh token
- 404 Not Found: Invalid item/realm ID
- 429 Too Many Requests: Rate limited, implement backoff
- 500 Server Error: Blizzard API down, show maintenance message
- Network Error: User offline, show cached data

**Error Recovery**:
- Automatic token refresh on 401
- Retry with exponential backoff (3 attempts)
- Fallback to cached data when available
- User-friendly error messages

---

## **5. Data Models & Types**

### **5.1 TypeScript Interfaces**

```typescript
// Realm Types
interface ConnectedRealm {
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

interface Realm {
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
interface AuctionHouse {
  auctions: Auction[];
}

interface Auction {
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

interface Modifier {
  type: number;
  value: number;
}

// Item Types
interface Item {
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

interface ItemStat {
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

interface ItemSpell {
  spell: {
    id: number;
    name: string;
  };
  description: string;
}

interface ItemMedia {
  assets: Array<{
    key: string;
    value: string; // URL to image
  }>;
}

// Recipe Types
interface Recipe {
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

interface Reagent {
  reagent: {
    id: number;
    name: string;
  };
  quantity: number;
}

// Processed Data Types
interface PriceSnapshot {
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

interface OHLCV {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface WatchlistItem {
  itemId: number;
  addedAt: number;
  notes?: string;
  targetPrice?: number;
}

interface PriceAlert {
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

interface MarketStats {
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
```

---

## **6. Client-Side Storage Schema**

### **6.1 localStorage Keys**

```typescript
// User Preferences
'selectedRealmId': number
'favoriteRealms': number[]
'theme': 'dark' | 'light' | 'system'
'autoRefreshEnabled': boolean
'refreshInterval': number // minutes
'compactMode': boolean
'animationsEnabled': boolean

// User Data
'watchlist': WatchlistItem[]
'priceAlerts': PriceAlert[]
'searchHistory': string[]
'recentItems': number[]
'savedFilters': SavedFilter[]
'calculatorHistory': Calculation[]

// Settings
'chartSettings': {
  defaultTimeframe: string;
  defaultChartType: string;
  indicators: string[];
}
'notificationSettings': {
  browserEnabled: boolean;
  soundEnabled: boolean;
  volume: number;
}
'displaySettings': {
  goldFormat: 'full' | 'compact';
  dateFormat: string;
  timeFormat: '12h' | '24h';
}
```

### **6.2 IndexedDB Schema**

**Database Name**: `WoWMarketTrackerDB`

**Stores**:

1. **priceHistory**
   - Key: `{itemId}-{realmId}-{timestamp}`
   - Indexes: itemId, realmId, timestamp
   - Data: PriceSnapshot objects
   - TTL: 1 year

2. **itemsCache**
   - Key: itemId
   - Indexes: name, categoryId, quality
   - Data: Item objects
   - TTL: 7 days

3. **auctionsCache**
   - Key: `{realmId}-{timestamp}`
   - Indexes: realmId, timestamp
   - Data: Auction[] arrays
   - TTL: 1 hour

4. **mediaCache**
   - Key: itemId
   - Data: ItemMedia objects (icon URLs)
   - TTL: 30 days

5. **chartDataCache**
   - Key: `{itemId}-{realmId}-{timeframe}`
   - Data: OHLCV[] arrays
   - TTL: 1 day

---

## **7. Component Hierarchy**

### **7.1 Layout Components**

```
App
├── RootLayout
│   ├── Header
│   │   ├── Logo
│   │   ├── SearchBar
│   │   ├── RealmSwitcher
│   │   ├── Navigation
│   │   └── ThemeToggle
│   ├── Main
│   │   └── [Page Content]
│   └── Footer
```

### **7.2 Page Components**

**Homepage**:
```
HomePage
├── HeroSection
│   ├── RealmDisplay
│   └── QuickStats
├── TopGainersSection
│   └── ItemCardGrid
├── TopLosersSection
│   └── ItemCardGrid
├── MostTradedSection
│   └── ItemCardGrid
├── TrendingSection
│   └── ItemCarousel
└── CategoriesSection
    └── CategoryGrid
```

**Item Detail Page**:
```
ItemDetailPage
├── ItemHeader
│   ├── ItemIcon
│   ├── ItemInfo
│   └── ActionButtons
├── PriceSection
│   ├── CurrentPriceCard
│   ├── PriceStatsGrid
│   └── PriceChangeIndicators
├── ChartSection
│   ├── PriceChart (Lightweight Charts)
│   ├── VolumeChart
│   └── ChartControls
├── MarketDepthSection
│   └── DepthChart
├── ListingsSection
│   └── ListingsTable
├── StatsSection
│   └── StatsCards
└── RelatedSection
    └── RelatedItems
```

**Watchlist Page**:
```
WatchlistPage
├── WatchlistHeader
│   ├── Title
│   ├── BulkActions
│   └── ViewToggle
├── WatchlistFilters
├── WatchlistTable
│   ├── WatchlistRow[]
│   └── Pagination
└── EmptyState (if no items)
```

---

## **8. Styling & Design System**

### **8.1 Color Palette**

**Dark Theme (Default)**:
```css
--background: #0B0E11;
--surface: #161A1E;
--surface-elevated: #1E2329;
--border: #2B3139;
--border-hover: #363D47;

--text-primary: #E6E8EA;
--text-secondary: #848E9C;
--text-tertiary: #5E6673;

--primary: #3861FB;
--primary-hover: #4C6FFC;
--primary-dark: #2651F5;

--success: #0ECB81;
--success-hover: #18D88E;
--danger: #F6465D;
--danger-hover: #F85A6E;
--warning: #F0B90B;
--warning-hover: #F3C420;

--gold: #FFD700;
--silver: #C0C0C0;
--copper: #CD7F32;
```

**Light Theme**:
```css
--background: #FFFFFF;
--surface: #F5F5F5;
--surface-elevated: #FFFFFF;
--border: #E6E6E6;
--border-hover: #CCCCCC;

--text-primary: #111111;
--text-secondary: #666666;
--text-tertiary: #999999;

/* Accent colors remain same */
```

### **8.2 Typography**

**Font Families**:
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Font Sizes**:
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### **8.3 Spacing Scale**

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### **8.4 Border Radius**

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-full: 9999px;
```

### **8.5 Shadows**

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## **9. Implementation Guide for AI Agent**

### **9.1 Step-by-Step Implementation Order**

**Phase 1: Foundation (Days 1-2)**
1. Initialize Next.js project with TypeScript
2. Install and configure dependencies
3. Set up folder structure
4. Configure Tailwind CSS
5. Set up Blizzard API credentials
6. Create API proxy routes for Blizzard API
7. Implement OAuth token management
8. Create basic layout (Header, Footer)
9. Implement theme system (dark/light)
10. Set up localStorage and IndexedDB utilities

**Phase 2: Core Features (Days 3-5)**
11. Implement realm selection functionality
12. Create realm list page
13. Build item search API route
14. Create search component with autocomplete
15. Implement item detail API routes
16. Build item detail page
17. Create price display components
18. Implement auction data fetching
19. Build price calculation utilities
20. Create gold formatter utility

**Phase 3: Charts & Visualizations (Days 6-7)**
21. Integrate Lightweight Charts
22. Create price chart component
23. Implement OHLCV data aggregation
24. Build volume chart component
25. Add chart controls (timeframe, type)
26. Create sparkline component
27. Implement chart export functionality

**Phase 4: Advanced Features (Days 8-10)**
28. Build watchlist functionality
29. Create watchlist page and components
30. Implement price alerts system
31. Create alert management page
32. Build calculator page (crafting/flipping)
33. Implement item comparison page
34. Create market overview dashboard
35. Build top gainers/losers components
36. Implement trending items detection

**Phase 5: Polish & Optimization (Days 11-12)**
37. Implement all filter options
38. Create analytics dashboard
39. Add mobile responsive design
40. Optimize performance (code splitting, lazy loading)
41. Implement error boundaries
42. Add loading states everywhere
43. Create empty states
44. Implement SEO optimizations
45. Add accessibility improvements
46. Test all features thoroughly

### **9.2 Environment Setup**

**Create `.env.local` file**:
```bash
# Blizzard API Credentials
NEXT_PUBLIC_BLIZZARD_REGION=us
BLIZZARD_CLIENT_ID=your_client_id_here
BLIZZARD_CLIENT_SECRET=your_client_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_CACHE_DURATION=300000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
```

**Getting Blizzard API Credentials**:
1. Go to https://develop.battle.net/
2. Create a new application
3. Note your Client ID and Client Secret
4. Set OAuth Redirect URL (for future auth features)

### **9.3 Installation Commands**

```bash
# Create Next.js app
npx create-next-app@latest wow-market-tracker --typescript --tailwind --app --src-dir

# Navigate to project
cd wow-market-tracker

# Install core dependencies
npm install @tanstack/react-query zustand

# Install UI components (shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select dialog dropdown-menu table tabs toast

# Install charts
npm install lightweight-charts recharts

# Install utilities
npm install date-fns zod react-hook-form @hookform/resolvers
npm install clsx tailwind-merge
npm install lucide-react
npm install dexie dexie-react-hooks

# Install additional libraries
npm install axios
npm install react-hot-toast
npm install framer-motion
npm install numeral
npm install papaparse
npm install @types/papaparse --save-dev

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint prettier eslint-config-prettier
npm install -D @next/bundle-analyzer
```

### **9.4 Key Implementation Files**

**`lib/blizzard-api.ts`** - Blizzard API client:
```typescript
import axios, { AxiosInstance } from 'axios';

interface BlizzardToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

class BlizzardAPIClient {
  private clientId: string;
  private clientSecret: string;
  private region: string;
  private token: BlizzardToken | null = null;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.clientId = process.env.BLIZZARD_CLIENT_ID!;
    this.clientSecret = process.env.BLIZZARD_CLIENT_SECRET!;
    this.region = process.env.NEXT_PUBLIC_BLIZZARD_REGION || 'us';
    
    this.axiosInstance = axios.create({
      timeout: 10000,
    });
  }

  private async getAccessToken(): Promise<string> {
    // Check if token exists and is not expired
    if (this.token && Date.now() < this.token.expires_at) {
      return this.token.access_token;
    }

    // Request new token
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    try {
      const response = await axios.post<Omit<BlizzardToken, 'expires_at'>>(
        `https://${this.region}.battle.net/oauth/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.token = {
        ...response.data,
        expires_at: Date.now() + (response.data.expires_in * 1000) - 60000, // 1 min buffer
      };

      return this.token.access_token;
    } catch (error) {
      console.error('Failed to get Blizzard API token:', error);
      throw new Error('Authentication failed');
    }
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const token = await this.getAccessToken();
    const baseUrl = `https://${this.region}.api.blizzard.com`;

    try {
      const response = await this.axiosInstance.get<T>(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          locale: 'en_US',
          ...params,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, clear and retry
        this.token = null;
        return this.request<T>(endpoint, params);
      }
      throw error;
    }
  }

  // Public API methods
  async getConnectedRealms() {
    return this.request('/data/wow/connected-realm/index', {
      namespace: `dynamic-${this.region}`,
    });
  }

  async getConnectedRealmDetails(realmId: number) {
    return this.request(`/data/wow/connected-realm/${realmId}`, {
      namespace: `dynamic-${this.region}`,
    });
  }

  async getAuctions(connectedRealmId: number) {
    return this.request(`/data/wow/connected-realm/${connectedRealmId}/auctions`, {
      namespace: `dynamic-${this.region}`,
    });
  }

  async searchItems(query: string, page: number = 1) {
    return this.request('/data/wow/search/item', {
      namespace: `static-${this.region}`,
      'name.en_US': query,
      orderby: 'name',
      _page: page,
    });
  }

  async getItemDetails(itemId: number) {
    return this.request(`/data/wow/item/${itemId}`, {
      namespace: `static-${this.region}`,
    });
  }

  async getItemMedia(itemId: number) {
    return this.request(`/data/wow/media/item/${itemId}`, {
      namespace: `static-${this.region}`,
    });
  }

  async getRecipe(recipeId: number) {
    return this.request(`/data/wow/recipe/${recipeId}`, {
      namespace: `static-${this.region}`,
    });
  }
}

export const blizzardAPI = new BlizzardAPIClient();
```

**`app/api/blizzard/auctions/[realmId]/route.ts`** - API route example:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { blizzardAPI } from '@/lib/blizzard-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { realmId: string } }
) {
  try {
    const realmId = parseInt(params.realmId);
    
    if (isNaN(realmId)) {
      return NextResponse.json(
        { error: 'Invalid realm ID' },
        { status: 400 }
      );
    }

    const data = await blizzardAPI.getAuctions(realmId);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch auction data' },
      { status: error.response?.status || 500 }
    );
  }
}
```

### **9.5 Critical Implementation Notes**

1. **API Routes are Required**: Even though this is frontend-only, you MUST use Next.js API routes to proxy Blizzard API calls. This hides your credentials and handles authentication.

2. **Token Management**: Implement token caching and refresh logic in the API client. Don't request a new token for every API call.

3. **Data Caching**: Cache auction data aggressively (5-10 minutes) since WoW auction house only updates every hour.

4. **Price Calculations**: All price calculations must be done client-side from raw auction data. Calculate min, max, average, median, etc.

5. **Historical Data**: Store price snapshots in IndexedDB. Every time you fetch auction data, save a snapshot for historical charts.

6. **OHLCV Aggregation**: Convert price snapshots into candlestick data for different timeframes (1h, 1d, 1w, etc.).

7. **Gold Formatting**: Store all prices in copper (smallest unit). Convert to gold/silver/copper for display.

8. **Performance**: Use React Query for data fetching with stale-while-revalidate. Implement virtual scrolling for long lists.

9. **Mobile First**: Design for mobile first, then scale up. Use Tailwind's responsive utilities.

10. **Error Handling**: Every API call must have proper error handling with user-friendly messages.

---

## **10. Testing Requirements**

### **10.1 Manual Testing Checklist**

- [ ] All pages load without errors
- [ ] Realm selection works
- [ ] Search finds items
- [ ] Item detail page displays correctly
- [ ] Charts render properly
- [ ] Watchlist add/remove works
- [ ] Alerts trigger correctly
- [ ] Calculator gives accurate results
- [ ] Theme toggle works
- [ ] Mobile navigation works
- [ ] All links function
- [ ] Forms validate correctly
- [ ] Error states display properly
- [ ] Loading states appear
- [ ] No console errors

### **10.2 Browser Testing**

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### **10.3 Performance Testing**

- [ ] Lighthouse score > 90
- [ ] Page load time < 2s
- [ ] Charts render at 60 FPS
- [ ] No memory leaks
- [ ] Bundle size < 250KB initial
- [ ] Images optimized
- [ ] API calls cached properly

---

## **11. Deployment Guide**

### **11.1 Deployment to Vercel**

**Prerequisites**:
- GitHub account
- Vercel account (free tier works)
- Blizzard API credentials

**Steps**:

1. **Prepare Repository**:
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**:
- Go to https://vercel.com
- Click "Import Project"
- Select your GitHub repository
- Configure project:
  - Framework Preset: Next.js
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: `.next`

3. **Add Environment Variables** in Vercel dashboard:
```
NEXT_PUBLIC_BLIZZARD_REGION=us
BLIZZARD_CLIENT_ID=your_client_id
BLIZZARD_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

4. **Deploy**:
- Click "Deploy"
- Wait for build to complete
- Your app is live!

### **11.2 Custom Domain (Optional)**

1. Purchase domain from any registrar
2. In Vercel dashboard, go to Project Settings > Domains
3. Add your custom domain
4. Configure DNS records as instructed
5. Wait for DNS propagation (up to 24 hours)

### **11.3 Continuous Deployment**

Once set up, Vercel automatically:
- Deploys on every push to main branch
- Creates preview deployments for pull requests
- Provides deployment URLs for testing

---

## **12. Analytics & Monitoring**

### **12.1 Analytics Events to Track**

**User Engagement**:
- Page views
- Search queries
- Item views
- Watchlist additions
- Alert creations
- Calculator usage
- Chart interactions
- Realm switches

**Performance Metrics**:
- Page load times
- API response times
- Chart render times
- Error rates
- Cache hit rates

**User Behavior**:
- Session duration
- Pages per session
- Bounce rate
- Return visitor rate
- Popular items
- Popular searches

### **12.2 Error Tracking**

Implement error logging for:
- JavaScript errors
- API errors
- Network failures
- Authentication failures
- Data parsing errors
- Chart rendering errors

Use console.error() with structured logging:
```typescript
console.error('API_ERROR', {
  endpoint: '/api/auctions/123',
  status: 500,
  message: 'Failed to fetch',
  timestamp: Date.now(),
});
```

---

## **13. Maintenance & Updates**

### **13.1 Regular Maintenance Tasks**

**Weekly**:
- Monitor API usage vs rate limits
- Check error logs
- Review performance metrics
- Test critical features

**Monthly**:
- Update dependencies (`npm update`)
- Review and clear old IndexedDB data
- Check Blizzard API for changes
- Analyze user feedback
- Review bundle size

**Per WoW Patch**:
- Update item categories if changed
- Add new expansion items
- Update profession recipes
- Test for breaking changes
- Update UI for new content

### **13.2 Known Limitations**

1. **Data Freshness**: WoW auction house updates hourly, so real-time means "within the hour"
2. **Historical Data**: Only available from when user first views item (no pre-existing history)
3. **API Rate Limits**: 36k requests/hour shared across all users
4. **No User Authentication**: All data stored locally (lost if browser cache cleared)
5. **Single Region**: User must select one region at a time
6. **No Transaction History**: Can't track actual sales, only listings
7. **Browser Storage Limits**: IndexedDB has size limits (varies by browser)

### **13.3 Future Enhancements**

**Short Term** (1-3 months):
- Export more data formats (Excel, PDF)
- More chart indicators (RSI, MACD, etc.)
- Price prediction using ML
- Cross-realm arbitrage calculator
- Guild bank integration
- API webhooks for alerts

**Medium Term** (3-6 months):
- User accounts (optional)
- Cloud sync for watchlists
- Public portfolios and profiles
- Community features (comments, ratings)
- Advanced analytics (correlation analysis)
- Historical data API
- Mobile app (React Native)

**Long Term** (6+ months):
- Multi-game support (other MMOs)
- Advanced ML price predictions
- Automated trading recommendations
- Integration with in-game addons
- Desktop app (Electron)
- API marketplace for developers
- Premium features and subscriptions

---

## **14. Documentation**

### **14.1 User Documentation**

Create in-app help sections for:

**Getting Started**:
- How to select your realm
- How to search for items
- Understanding price data
- Reading charts

**Features Guide**:
- Using the watchlist
- Setting up price alerts
- Using the calculator
- Comparing items
- Understanding market analytics

**FAQ**:
- Where does the data come from?
- How often is data updated?
- Why don't I see history for some items?
- What do the different prices mean?
- How accurate are the predictions?
- Is my data private?
- Can I use this on mobile?

### **14.2 Developer Documentation**

If you open-source or provide API:

**API Documentation**:
- Authentication
- Rate limits
- Endpoints
- Request/response formats
- Error codes
- Examples

**Contributing Guide**:
- How to set up dev environment
- Code style guide
- Pull request process
- Testing requirements

---

## **15. Security Considerations**

### **15.1 Security Measures**

**API Security**:
- Never expose Blizzard credentials to client
- Use Next.js API routes as proxy
- Implement rate limiting on API routes
- Validate all input data
- Sanitize user input
- Use HTTPS only

**Client Security**:
- XSS prevention (React handles this)
- CSRF protection (Next.js handles this)
- Content Security Policy headers
- Secure cookie settings
- No sensitive data in localStorage

**Data Privacy**:
- No personal data collection
- No user tracking (optional analytics)
- GDPR compliant (EU users)
- Clear privacy policy
- Data export capability
- Data deletion on request

### **15.2 Rate Limiting**

Implement client-side rate limiting:
```typescript
// lib/rate-limiter.ts
class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private window: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    
    if (this.requests.length >= this.limit) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

export const apiLimiter = new RateLimiter(100, 60000); // 100 requests per minute
```

---

## **16. Success Metrics**

### **16.1 Launch Goals (First Month)**

- 1,000+ unique visitors
- 500+ returning users
- Average session duration > 5 minutes
- < 2% error rate
- All Core Web Vitals in "Good" range
- Mobile usage > 30%

### **16.2 Growth Goals (3 Months)**

- 10,000+ monthly active users
- 5,000+ items in user watchlists
- 1,000+ price alerts created
- > 50% user retention rate
- Featured in WoW community (Reddit, Discord)
- Mentioned by content creators

### **16.3 Technical KPIs**

**Performance**:
- LCP < 2.5s (95th percentile)
- FID < 100ms (95th percentile)
- CLS < 0.1 (95th percentile)
- API uptime > 99.5%
- Average API response < 300ms

**Engagement**:
- Pages per session > 5
- Average session > 5 minutes
- Bounce rate < 40%
- Watchlist adoption > 60%
- Alert adoption > 40%
- Calculator usage > 30%

---

## **17. AI Agent Instructions Summary**

### **17.1 Critical Requirements**

**MUST HAVE**:
1. ✅ Next.js 14+ with App Router
2. ✅ TypeScript strict mode
3. ✅ Tailwind CSS for styling
4. ✅ Blizzard API integration via Next.js API routes
5. ✅ OAuth token management (server-side)
6. ✅ Real-time price display from auction data
7. ✅ Interactive charts with Lightweight Charts
8. ✅ Watchlist with localStorage
9. ✅ Price alerts with browser notifications
10. ✅ Mobile responsive design
11. ✅ Dark/light theme
12. ✅ Error handling everywhere
13. ✅ Loading states everywhere
14. ✅ Client-side data caching (IndexedDB)
15. ✅ Gold formatting (g/s/c)

**DO NOT INCLUDE**:
- ❌ Custom backend server
- ❌ Database server (PostgreSQL, MongoDB, etc.)
- ❌ Authentication system (NextAuth, user accounts)
- ❌ Payment processing
- ❌ Email services
- ❌ Complex DevOps setup
- ❌ Docker containers
- ❌ Kubernetes
- ❌ CI/CD pipelines (beyond Vercel auto-deploy)

### **17.2 Implementation Priority**

**Phase 1 - Core (MUST DO FIRST)**:
1. Project setup and configuration
2. Blizzard API client and routes
3. Realm selection
4. Item search
5. Item detail page with prices
6. Basic charts

**Phase 2 - Essential Features**:
7. Watchlist functionality
8. Price alerts
9. Market overview dashboard
10. Mobile responsive

**Phase 3 - Enhanced Features**:
11. Calculator
12. Item comparison
13. Advanced filtering
14. Analytics dashboard

**Phase 4 - Polish**:
15. Performance optimization
16. SEO optimization
17. Accessibility improvements
18. Testing and bug fixes

### **17.3 Code Quality Standards**

**TypeScript**:
- Use strict mode
- Define types for all data
- No `any` types (use `unknown` if needed)
- Interface over type when possible
- Export types for reuse

**React**:
- Functional components only
- Use hooks properly
- Memoize expensive computations
- Avoid prop drilling (use context/zustand)
- Clean up effects properly

**Performance**:
- Code split routes
- Lazy load heavy components
- Optimize images
- Cache API responses
- Debounce search inputs
- Virtual scroll long lists

**Styling**:
- Use Tailwind utilities
- Follow design system colors
- Responsive by default
- Dark mode support
- Consistent spacing

**Error Handling**:
- Try-catch all async operations
- User-friendly error messages
- Log errors to console
- Graceful degradation
- Retry failed requests

### **17.4 File Naming Conventions**

- **Components**: PascalCase (e.g., `ItemCard.tsx`)
- **Utils/Libs**: camelCase (e.g., `goldFormatter.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuctionData.ts`)
- **Types**: PascalCase (e.g., `Item.ts`, `Auction.ts`)
- **API Routes**: kebab-case (e.g., `[item-id]/route.ts`)
- **Pages**: kebab-case folders, `page.tsx` for route

### **17.5 Common Pitfalls to Avoid**

1. ❌ **Don't** expose Blizzard credentials to client
   - ✅ Always use Next.js API routes as proxy

2. ❌ **Don't** request new token for every API call
   - ✅ Cache token and refresh when expired

3. ❌ **Don't** fetch auction data more than every 5 minutes
   - ✅ Implement aggressive caching

4. ❌ **Don't** store large data in localStorage
   - ✅ Use IndexedDB for large datasets

5. ❌ **Don't** forget loading states
   - ✅ Every async operation needs loading UI

6. ❌ **Don't** ignore mobile users
   - ✅ Test on mobile devices

7. ❌ **Don't** use inline styles
   - ✅ Use Tailwind utilities

8. ❌ **Don't** forget error boundaries
   - ✅ Wrap components that might error

9. ❌ **Don't** block the main thread
   - ✅ Use Web Workers for heavy calculations

10. ❌ **Don't** skip accessibility
    - ✅ Use semantic HTML and ARIA labels

### **17.6 Testing Before Deployment**

**Checklist**:
- [ ] Test realm selection and switching
- [ ] Test item search with various queries
- [ ] Test item detail page loads
- [ ] Test charts render and are interactive
- [ ] Test watchlist add/remove/persist
- [ ] Test alerts trigger correctly
- [ ] Test calculator gives correct results
- [ ] Test on mobile devices
- [ ] Test dark/light theme switch
- [ ] Test with slow network (throttle)
- [ ] Test error scenarios (API down)
- [ ] Test with different realms
- [ ] Check console for errors
- [ ] Run Lighthouse audit
- [ ] Test accessibility (keyboard nav)

---

## **18. Quick Start Commands**

### **18.1 Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

### **18.2 Useful Scripts to Add**

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "analyze": "ANALYZE=true npm run build",
    "clean": "rm -rf .next node_modules",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## **19. Troubleshooting Guide**

### **19.1 Common Issues**

**Issue**: Blizzard API returns 401 Unauthorized
- **Solution**: Check credentials, ensure token refresh logic works

**Issue**: Auction data not loading
- **Solution**: Verify realm ID is correct, check API route, check network tab

**Issue**: Charts not rendering
- **Solution**: Ensure data format is correct (OHLCV), check console for errors

**Issue**: Slow performance
- **Solution**: Check bundle size, implement code splitting, optimize images

**Issue**: Data not persisting
- **Solution**: Check localStorage/IndexedDB, ensure proper serialization

**Issue**: Mobile layout broken
- **Solution**: Test responsive breakpoints, check Tailwind classes

**Issue**: Theme not switching
- **Solution**: Check theme context, verify CSS variables, check localStorage

**Issue**: API rate limited
- **Solution**: Implement caching, reduce API calls, show user-friendly message

### **19.2 Debugging Tips**

1. **Use React DevTools**: Inspect component state and props
2. **Use Network Tab**: Monitor API calls and responses
3. **Use Console**: Log data at each step
4. **Use Lighthouse**: Identify performance issues
5. **Use Error Boundary**: Catch and display React errors
6. **Check IndexedDB**: Use browser DevTools to inspect stored data
7. **Test with Mock Data**: Create mock responses for testing

---

## **20. Final Checklist**

### **20.1 Before Deployment**

- [ ] All features implemented and working
- [ ] No console errors or warnings
- [ ] All API routes functional
- [ ] Environment variables configured
- [ ] Blizzard API credentials valid
- [ ] Data caching working properly
- [ ] Charts render correctly
- [ ] Mobile responsive verified
- [ ] Dark/light theme working
- [ ] Error handling in place
- [ ] Loading states everywhere
- [ ] SEO meta tags added
- [ ] Favicon and app icons added
- [ ] README.md updated
- [ ] .env.example created
- [ ] Code formatted and linted
- [ ] TypeScript errors fixed
- [ ] Lighthouse score > 90
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Privacy policy added (if needed)
- [ ] Terms of service added (if needed)

### **20.2 Post-Deployment**

- [ ] Verify production site loads
- [ ] Test all features in production
- [ ] Monitor for errors
- [ ] Check analytics setup
- [ ] Share with community
- [ ] Gather user feedback
- [ ] Plan future updates
- [ ] Monitor API usage
- [ ] Watch performance metrics

---

## **21. Conclusion**

This PRD provides complete specifications for building a professional WoW Market Tracker application. The application is:

**Frontend-Only**: No backend server required, uses Next.js API routes only as proxy to Blizzard API

**Fully Featured**: Includes all features needed for serious WoW auction house trading

**Production Ready**: Designed for deployment to Vercel with proper error handling, caching, and performance optimization

**Scalable**: Built with modern technologies that can handle growth

**User Friendly**: Professional UI with dark theme, responsive design, and intuitive navigation

**Data Driven**: Real-time prices, historical charts, market analytics, and trading tools

The AI agent implementing this PRD should follow the phase-by-phase approach, ensuring each feature is fully functional before moving to the next. The result will be a complete, professional trading platform for the WoW economy.

---

## **22. Additional Resources**

### **22.1 Blizzard API Documentation**
- Official Docs: https://develop.battle.net/documentation/world-of-warcraft
- OAuth Guide: https://develop.battle.net/documentation/guides/using-oauth
- Community APIs: https://www.wowhead.com/apis

### **22.2 Next.js Documentation**
- Next.js Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### **22.3 Libraries Documentation**
- TanStack Query: https://tanstack.com/query
- Lightweight Charts: https://tradingview.github.io/lightweight-charts/
- Zustand: https://github.com/pmndrs/zustand
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

### **22.4 WoW Community Resources**
- r/woweconomy: https://reddit.com/r/woweconomy
- The Undermine Journal: https://theunderminejournal.com
- WoWHead: https://www.wowhead.com

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Status**: Complete and Ready for Implementation

This PRD is comprehensive and includes everything needed to build a complete, professional WoW Market Tracker application using only Next.js frontend with Blizzard API integration.
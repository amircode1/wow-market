# WoW Market Tracker

A professional real-time auction house price tracking application for World of Warcraft. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🏠 Market Overview Dashboard
- Real-time market statistics
- Top gainers and losers
- Trending items
- Market value tracking

### 🔍 Item Search & Discovery
- Powerful search with autocomplete
- Advanced filtering options
- Item quality indicators
- Real-time price data

### 📊 Interactive Charts
- Professional candlestick charts
- Multiple timeframes (1h to 1y)
- Volume indicators
- Technical analysis tools

### ⭐ Watchlist Management
- Save favorite items
- Track price changes
- Bulk operations
- Export/import functionality

### 🚨 Price Alerts
- Set price targets
- Browser notifications
- Multiple alert types
- Alert management

### 🧮 Profit Calculator
- Crafting profit calculator
- Flipping calculator
- ROI analysis
- Break-even calculations

### ⚖️ Item Comparison
- Side-by-side comparison
- Up to 4 items
- Detailed metrics
- Best value indicators

### 🌍 Realm Selection
- All WoW realms supported
- Connected realm grouping
- Realm status indicators
- Quick realm switching

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4.0+
- **UI Components**: shadcn/ui
- **Charts**: Lightweight Charts (TradingView)
- **State Management**: Zustand + TanStack Query
- **Storage**: localStorage + IndexedDB (Dexie)
- **API**: Blizzard Battle.net API

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Blizzard API credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wow-market-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Blizzard API credentials:
```env
NEXT_PUBLIC_BLIZZARD_REGION=us
BLIZZARD_CLIENT_ID=your_client_id_here
BLIZZARD_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Blizzard API Setup

1. Go to [Blizzard Developer Portal](https://develop.battle.net/)
2. Create a new application
3. Note your Client ID and Client Secret
4. Add them to your `.env.local` file

## Project Structure

```
wow-market-tracker/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (Blizzard API proxy)
│   ├── items/              # Item pages
│   ├── realms/             # Realm selection
│   ├── watchlist/          # Watchlist management
│   ├── calculator/         # Profit calculator
│   ├── compare/            # Item comparison
│   └── settings/           # User settings
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── charts/             # Chart components
│   ├── items/              # Item-related components
│   ├── market/             # Market components
│   └── layout/             # Layout components
├── lib/                    # Utility libraries
│   ├── blizzard-api.ts     # Blizzard API client
│   ├── database.ts         # IndexedDB setup
│   ├── storage.ts          # localStorage utilities
│   └── utils.ts            # General utilities
├── hooks/                  # Custom React hooks
├── store/                  # Zustand stores
├── types/                  # TypeScript type definitions
└── config/                 # Configuration files
```

## Features in Detail

### Real-time Price Tracking
- Fetches auction house data every 5 minutes
- Calculates price statistics (min, max, avg, median)
- Tracks price changes over time
- Stores historical data locally

### Professional Charts
- Candlestick charts with OHLCV data
- Multiple timeframes and chart types
- Volume indicators
- Technical analysis tools
- Responsive design

### Smart Caching
- IndexedDB for large datasets
- localStorage for user preferences
- Aggressive API response caching
- Stale-while-revalidate strategy

### Mobile Responsive
- Mobile-first design
- Touch-optimized charts
- Responsive navigation
- PWA support

## API Endpoints

The application uses Next.js API routes as a proxy to the Blizzard API:

- `GET /api/blizzard/realms` - Get connected realms
- `GET /api/blizzard/realms/[id]` - Get realm details
- `GET /api/blizzard/auctions/[realmId]` - Get auction data
- `GET /api/blizzard/items/search` - Search items
- `GET /api/blizzard/items/[id]` - Get item details
- `GET /api/blizzard/items/[id]/media` - Get item media

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This application is not affiliated with Blizzard Entertainment. World of Warcraft is a trademark of Blizzard Entertainment. Data is provided by the Blizzard Battle.net API.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Made with ❤️ for the WoW community
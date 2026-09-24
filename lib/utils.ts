import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGold(copper: number): string {
  copper = Math.round(copper);
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperAmount = copper % 100;
  
  if (gold > 0) {
    return `${gold.toLocaleString()}g ${silver}s ${copperAmount}c`;
  }
  if (silver > 0) {
    return `${silver}s ${copperAmount}c`;
  }
  return `${copperAmount}c`;
}

export function formatGoldCompact(copper: number): string {
  copper = Math.round(copper);
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  
  if (gold > 0) {
    return `${gold.toLocaleString()}g`;
  }
  if (silver > 0) {
    return `${silver}s`;
  }
  return `${copper}c`;
}

export function parseGold(goldString: string): number {
  // Parse strings like "1,234g 56s 78c" or "1234g" or "56s" or "78c"
  const match = goldString.match(/(?:(\d+(?:,\d+)*)g)?\s*(?:(\d+)s)?\s*(?:(\d+)c)?/);
  if (!match) return 0;
  
  const gold = parseInt(match[1]?.replace(/,/g, '') || '0');
  const silver = parseInt(match[2] || '0');
  const copper = parseInt(match[3] || '0');
  
  return gold * 10000 + silver * 100 + copper;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function isValidItemId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

export function isValidRealmId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

export function getQualityColor(quality: string): string {
  const colors: Record<string, string> = {
    'POOR': '#9D9D9D',
    'COMMON': '#FFFFFF',
    'UNCOMMON': '#1EFF00',
    'RARE': '#0070DD',
    'EPIC': '#A335EE',
    'LEGENDARY': '#FF8000',
    'ARTIFACT': '#E6CC80',
    'HEIRLOOM': '#E6CC80',
  };
  return colors[quality] || '#FFFFFF';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch(async (error) => {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  });
}
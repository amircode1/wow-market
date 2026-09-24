import axios, { AxiosInstance } from 'axios';
import { getBlizzardConfig } from '@/config/blizzard';
import type {
  ConnectedRealm,
  AuctionHouse,
  Item,
  ItemMedia,
  Recipe,
  SearchResponse,
  Realm,
  WowTokenPrice
} from '@/types';

class BlizzardAPIClient {
  private region: string;
  private accessToken: string;
  private axiosInstance: AxiosInstance;
  private oauthUrl: string;
  private clientId: string;
  private clientSecret: string;
  private tokenExpiresAt: number | null = null;
  private tokenPromise: Promise<string> | null = null;
  private baseUrl: string;

  constructor(regionOverride?: string) {
    const config = getBlizzardConfig(regionOverride as any);
    this.region = config.region;
    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;
    this.oauthUrl = config.oauthUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    
    this.axiosInstance = axios.create({
      timeout: 10000,
      baseURL: this.baseUrl,
    });
  }

  // Method to update region dynamically
  setRegion(region: string) {
    const config = getBlizzardConfig(region as any);
    this.region = config.region;
    this.baseUrl = config.baseUrl;
    this.oauthUrl = config.oauthUrl;
    // Reset token when region changes
    this.tokenExpiresAt = null;
    this.accessToken = config.accessToken;
    // Update axios instance base URL
    this.axiosInstance.defaults.baseURL = this.baseUrl;
  }

  private async fetchToken(): Promise<string> {
    // اگر در حال گرفتن توکن هستیم، همان promise را برگردان
    if (this.tokenPromise) return this.tokenPromise;

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Blizzard client credentials (BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET) are required for automatic token refresh');
    }

    console.log('Fetching new Blizzard access token...');

    this.tokenPromise = axios
      .post(
        this.oauthUrl,
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          auth: {
            username: this.clientId,
            password: this.clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then((res) => {
        const token = res.data?.access_token as string;
        const expiresIn = res.data?.expires_in as number | undefined;
        
        if (!token) {
          throw new Error('Failed to obtain access token from Blizzard API');
        }

        // توکن را ذخیره کن و زمان انقضا را تنظیم کن (1 دقیقه زودتر refresh می‌کنیم)
        this.tokenExpiresAt = expiresIn ? Date.now() + expiresIn * 1000 - 60_000 : null;
        this.accessToken = token;
        
        console.log(`New access token obtained. Expires in ${expiresIn} seconds.`);
        return token;
      })
      .catch((error) => {
        console.error('Failed to fetch Blizzard access token:', error.message);
        throw new Error(`Failed to fetch access token: ${error.message}`);
      })
      .finally(() => {
        this.tokenPromise = null;
      });

    return this.tokenPromise;
  }

  private async ensureAccessToken() {
    const hasStaticToken = !!this.accessToken;
    const hasClientCreds = !!this.clientId && !!this.clientSecret;
    const isExpired = this.tokenExpiresAt !== null && Date.now() >= this.tokenExpiresAt;
    
    // اگر توکن نداریم یا منقضی شده و client credentials داریم، توکن جدید بگیر
    if ((!hasStaticToken || isExpired) && hasClientCreds) {
      await this.fetchToken();
    } else if (!hasStaticToken && !hasClientCreds) {
      throw new Error('Blizzard access token is missing and client credentials are not configured. Please set BLIZZARD_ACCESS_TOKEN or BLIZZARD_CLIENT_ID/BLIZZARD_CLIENT_SECRET.');
    }
  }

  private async withAuth<T>(fn: (token: string) => Promise<T>): Promise<T> {
    await this.ensureAccessToken();
    try {
      return await fn(this.accessToken);
    } catch (err: any) {
      const status = err?.response?.status;
      const hasClientCreds = !!this.clientId && !!this.clientSecret;
      
      // اگر 401 گرفتیم و client credentials داریم، توکن جدید بگیر و دوباره تلاش کن
      if (status === 401 && hasClientCreds) {
        console.log('Token expired or invalid, fetching new token...');
        // توکن قبلی را پاک کن تا توکن جدید بگیریم
        this.tokenExpiresAt = null;
        await this.fetchToken();
        return fn(this.accessToken);
      }
      throw err;
    }
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    return this.withAuth(async (token) => {
      try {
        const response = await this.axiosInstance.get<T>(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            locale: 'en_US',
            ...params,
          },
        });
        return response.data;
      } catch (error: any) {
        // Log detailed error for debugging
        console.error('API Request Error:', {
          endpoint,
          params,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    });
  }

  // Public API methods
  async getConnectedRealms() {
    return this.request<{ connected_realms: Array<{ href: string }> }>('/data/wow/connected-realm/index', {
      namespace: `dynamic-${this.region}`,
    });
  }

  async getConnectedRealmDetails(realmId: number) {
    return this.request<ConnectedRealm>(`/data/wow/connected-realm/${realmId}`, {
      namespace: `dynamic-${this.region}`,
    });
  }

  async getAuctions(connectedRealmId: number) {
    return this.request<AuctionHouse>(`/data/wow/connected-realm/${connectedRealmId}/auctions`, {
      namespace: `dynamic-${this.region}`,
    });
  }

  // Region-wide commodities auction house (trade goods, etc.)
  async getCommodities() {
    return this.request<{ auctions: Array<{ item: { id: number }; quantity: number; unit_price: number }> }>(
      `/data/wow/auctions/commodities`,
      {
        namespace: `dynamic-${this.region}`,
      }
    );
  }

  async getWowTokenPrice() {
    return this.request<WowTokenPrice>('/data/wow/token/index', {
      namespace: `dynamic-${this.region}`,
    });
  }

  async searchItems(query: string, page: number = 1) {
    // Build params object with proper encoding
    const params: Record<string, any> = {
      namespace: `static-${this.region}`,
      orderby: 'name',
      _page: page.toString(),
      _pageSize: '20',
    };
    
    // Add name filter - Blizzard API expects name.en_US format
    params['name.en_US'] = query;
    
    return this.request<SearchResponse<Item>>('/data/wow/search/item', params);
  }

  async getItemDetails(itemId: number) {
    return this.request<Item>(`/data/wow/item/${itemId}`, {
      namespace: `static-${this.region}`,
    });
  }

  async getItemMedia(itemId: number) {
    return this.request<ItemMedia>(`/data/wow/media/item/${itemId}`, {
      namespace: `static-${this.region}`,
    });
  }

  async getRecipe(recipeId: number) {
    return this.request<Recipe>(`/data/wow/recipe/${recipeId}`, {
      namespace: `static-${this.region}`,
    });
  }

  async searchRecipes(query: string) {
    return this.request<SearchResponse<Recipe>>('/data/wow/search/recipe', {
      namespace: `static-${this.region}`,
      'name.en_US': query,
    });
  }

  // Utility methods
  getItemIconUrl(itemId: number): string {
    return `https://render.worldofwarcraft.com/us/icons/56/${itemId}.jpg`;
  }

  getItemIconUrlHighRes(itemId: number): string {
    return `https://render.worldofwarcraft.com/us/icons/256/${itemId}.jpg`;
  }

  /**
   * Public helper used by the /api/blizzard/token health-check route to
   * verify that credentials are configured and a token can be obtained.
   */
  async verifyCredentials(): Promise<void> {
    await this.ensureAccessToken();
  }
}

// Export class instead of instance to allow region-specific instances
export { BlizzardAPIClient };

// Default instance (for backward compatibility, uses default region from env)
export const blizzardAPI = new BlizzardAPIClient();

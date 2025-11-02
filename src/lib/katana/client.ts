// Katana API Client with Rate Limiting and Error Handling

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { katanaRateLimiter } from './utils/rate-limiter';
import { withRetry, RetryError } from './utils/retry';
import type { KatanaAPIResponse, KatanaError } from './types';

export class KatanaAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'KatanaAPIError';
  }
}

export class KatanaAPIClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || process.env.KATANA_API_KEY || '';
    this.baseURL = baseURL || process.env.KATANA_BASE_URL || 'https://api.katanamrp.com/v1';

    if (!this.apiKey) {
      throw new Error('Katana API key is required. Set KATANA_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔵 Katana API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Katana API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  private handleResponseError(error: any): Promise<never> {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      let message = 'Katana API error';
      let code = 'KATANA_API_ERROR';

      if (data && data.message) {
        message = data.message;
      } else if (data && data.error) {
        message = data.error;
      }

      if (data && data.code) {
        code = data.code;
      }

      console.error(`❌ Katana API Error ${status}:`, message);

      throw new KatanaAPIError(message, status, code, data);
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response from Katana API:', error.message);
      throw new KatanaAPIError(
        'No response from Katana API. Check your network connection.',
        undefined,
        'NO_RESPONSE'
      );
    } else {
      // Something else happened
      console.error('❌ Katana API request error:', error.message);
      throw new KatanaAPIError(error.message, undefined, 'REQUEST_ERROR');
    }
  }

  private async request<T>(
    config: AxiosRequestConfig,
    skipRateLimit: boolean = false
  ): Promise<T> {
    // Apply rate limiting
    if (!skipRateLimit) {
      await katanaRateLimiter.waitIfNeeded();
    }

    // Execute request with retry logic
    try {
      const response = await withRetry(
        () => this.client.request<T>(config),
        {
          maxAttempts: 3,
          initialDelay: 1000,
          retryableStatuses: [429, 500, 502, 503, 504],
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof RetryError) {
        console.error(`❌ Request failed after ${error.attempts} attempts:`, error.lastError.message);
        throw error.lastError;
      }
      throw error;
    }
  }

  // ==================== HTTP Methods ====================

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<KatanaAPIResponse<T>> {
    return this.request<KatanaAPIResponse<T>>({
      method: 'GET',
      url: endpoint,
      params,
    });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<KatanaAPIResponse<T>> {
    return this.request<KatanaAPIResponse<T>>({
      method: 'POST',
      url: endpoint,
      data,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<KatanaAPIResponse<T>> {
    return this.request<KatanaAPIResponse<T>>({
      method: 'PATCH',
      url: endpoint,
      data,
    });
  }

  async delete<T = any>(endpoint: string): Promise<KatanaAPIResponse<T>> {
    return this.request<KatanaAPIResponse<T>>({
      method: 'DELETE',
      url: endpoint,
    });
  }

  // ==================== Helper Methods ====================

  async testConnection(): Promise<boolean> {
    try {
      await this.get('/manufacturing_orders', { limit: 1 });
      console.log('✅ Successfully connected to Katana API');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Katana API:', error);
      return false;
    }
  }

  getRemainingRateLimit(): number {
    return katanaRateLimiter.getRemainingRequests();
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

// Singleton instance
let katanaClient: KatanaAPIClient | null = null;

export function getKatanaClient(): KatanaAPIClient {
  if (!katanaClient) {
    katanaClient = new KatanaAPIClient();
  }
  return katanaClient;
}

export function resetKatanaClient(): void {
  katanaClient = null;
}


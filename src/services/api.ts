import { ApiError, BaseResponse } from "~/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Generic type for request data
interface RequestData {
  [key: string]: unknown;
}

interface CacheOptions {
  revalidate?: number | false;
  tags?: string[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiService {
  private static instance: ApiService;
  private cache: Map<string, CacheEntry<any>>;
  private defaultCacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw error;
    }
    return response.json();
  }

  private createHeaders(): Headers {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return headers;
  }

  private getCacheKey(endpoint: string, method: string = 'GET'): string {
    return `${method}:${endpoint}`;
  }

  private setCache<T>(key: string, data: T, duration: number = this.defaultCacheDuration): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async get<T extends BaseResponse>(
    endpoint: string, 
    options: CacheOptions = { revalidate: 300 }
  ): Promise<T> {
    try {
      const cacheKey = this.getCacheKey(endpoint);
      const cachedData = this.getCache<T>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const fetchOptions: RequestInit = {
        method: "GET",
        headers: this.createHeaders(),
      };

      // Add Next.js 13 cache options
      if (typeof options.revalidate === 'number') {
        fetchOptions.next = {
          revalidate: options.revalidate,
          tags: options.tags,
        };
      } else if (options.revalidate === false) {
        fetchOptions.cache = 'no-store';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
      const data = await this.handleResponse<T>(response);
      
      // Cache the response if it's successful
      if (data && options.revalidate !== false) {
        this.setCache(cacheKey, data, 
          typeof options.revalidate === 'number' 
            ? options.revalidate * 1000 
            : this.defaultCacheDuration
        );
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T extends BaseResponse>(
    endpoint: string, 
    data: RequestData,
    invalidateTags?: string[]
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: this.createHeaders(),
        body: JSON.stringify(data),
        next: invalidateTags ? { tags: invalidateTags } : undefined,
      });
      const responseData = await this.handleResponse<T>(response);
      
      // Invalidate related GET cache entries
      if (invalidateTags) {
        this.invalidateCache(endpoint);
      }

      return responseData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T extends BaseResponse>(
    endpoint: string, 
    data: RequestData,
    invalidateTags?: string[]
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: this.createHeaders(),
        body: JSON.stringify(data),
        next: invalidateTags ? { tags: invalidateTags } : undefined,
      });
      const responseData = await this.handleResponse<T>(response);
      
      // Invalidate related GET cache entries
      if (invalidateTags) {
        this.invalidateCache(endpoint);
      }

      return responseData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T extends BaseResponse>(
    endpoint: string,
    invalidateTags?: string[]
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: this.createHeaders(),
        next: invalidateTags ? { tags: invalidateTags } : undefined,
      });
      const responseData = await this.handleResponse<T>(response);
      
      // Invalidate related GET cache entries
      if (invalidateTags) {
        this.invalidateCache(endpoint);
      }

      return responseData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  invalidateCache(endpoint?: string): void {
    if (endpoint) {
      const cacheKey = this.getCacheKey(endpoint);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        code: (error as { status?: number }).status || 500,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
      code: 500,
    };
  }
}

export const apiService = ApiService.getInstance();

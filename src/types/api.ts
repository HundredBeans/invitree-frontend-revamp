// Generic Strapi API response structure
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// For single item responses
export interface StrapiSingleResponse<T> {
  data: T;
}

// For array responses
export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Error response structure
export interface StrapiErrorResponse {
  error: {
    status: number;
    name: string;
    message: string;
    details?: Record<string, any>;
  };
}

// API request options
export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Loading state type
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Form validation error type
export interface FormErrors {
  [fieldName: string]: string | undefined;
}

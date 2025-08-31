import { signOut } from "next-auth/react";

// Type for Strapi validation error
interface StrapiValidationError {
  path?: string[];
  message: string;
}

// Type for Strapi error response
interface StrapiErrorResponse {
  error?: {
    message?: string;
    name?: string;
    details?: {
      errors?: StrapiValidationError[];
    };
  };
  message?: string;
}

export const ApiErrorHandler = {
  /**
   * Handles API errors and provides consistent error responses
   */
  async handleApiError(response: Response): Promise<never> {
    let errorData: StrapiErrorResponse;

    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, create a generic error
      errorData = {
        error: {
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }

    // Handle specific HTTP status codes
    switch (response.status) {
      case 401:
        // Unauthorized - redirect to login
        await signOut({ redirect: true, callbackUrl: "/login" });
        throw new ApiError(
          "Your session has expired. Please log in again.",
          401,
          "UNAUTHORIZED",
        );

      case 403:
        throw new ApiError(
          "You don't have permission to perform this action.",
          403,
          "FORBIDDEN",
        );

      case 404:
        throw new ApiError(
          "The requested resource was not found.",
          404,
          "NOT_FOUND",
        );

      case 422: {
        // Validation error - extract field-specific errors if available
        const validationMessage = this.extractValidationErrors(errorData);
        throw new ApiError(
          validationMessage,
          422,
          "VALIDATION_ERROR",
          errorData,
        );
      }

      case 429:
        throw new ApiError(
          "Too many requests. Please try again later.",
          429,
          "RATE_LIMITED",
        );

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError(
          "Server error. Please try again later.",
          response.status,
          "SERVER_ERROR",
        );

      default: {
        // Extract error message from Strapi error format or use generic message
        const message =
          errorData?.error?.message ||
          errorData?.message ||
          `Request failed with status ${response.status}`;

        throw new ApiError(
          message,
          response.status,
          errorData?.error?.name,
          errorData,
        );
      }
    }
  },

  /**
   * Extracts validation errors from Strapi error response
   */
  extractValidationErrors(errorData: StrapiErrorResponse): string {
    if (errorData?.error?.details?.errors) {
      const errors = errorData.error.details.errors;
      const errorMessages = errors.map((err: StrapiValidationError) => {
        const field = err.path?.join(".") || "field";
        return `${field}: ${err.message}`;
      });
      return errorMessages.join(", ");
    }

    return errorData?.error?.message || "Validation failed";
  },

  /**
   * Handles network errors (fetch failures)
   */
  handleNetworkError(error: Error): never {
    if (error.name === "AbortError") {
      throw new ApiError("Request was cancelled", 0, "CANCELLED");
    }

    if (error.message.includes("fetch")) {
      throw new ApiError(
        "Network error. Please check your connection.",
        0,
        "NETWORK_ERROR",
      );
    }

    throw new ApiError(error.message, 0, "UNKNOWN_ERROR", error);
  },

  /**
   * Wraps fetch requests with error handling
   */
  async safeFetch<T>(
    url: string,
    options: RequestInit = {},
    timeout = 10000,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleApiError(response);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      return this.handleNetworkError(error as Error);
    }
  },
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a specific type
   */
  isType(code: string): boolean {
    return this.code === code;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status ? this.status >= 400 && this.status < 500 : false;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status ? this.status >= 500 : false;
  }

  /**
   * Convert to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

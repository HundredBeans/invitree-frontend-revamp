import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ErrorState {
  message: string | null;
  code?: string;
  details?: any;
}

interface UseErrorHandlerReturn {
  error: ErrorState | null;
  isError: boolean;
  setError: (error: string | Error | null) => void;
  clearError: () => void;
  handleError: (error: unknown, customMessage?: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

// Common error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  // Handle API errors with specific structure
  if (error && typeof error === "object") {
    const apiError = error as any;
    
    // Strapi error format
    if (apiError.error?.message) {
      return apiError.error.message;
    }
    
    // Generic API error format
    if (apiError.message) {
      return apiError.message;
    }

    // HTTP status code handling
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
          return ERROR_MESSAGES.UNAUTHORIZED;
        case 403:
          return ERROR_MESSAGES.FORBIDDEN;
        case 404:
          return ERROR_MESSAGES.NOT_FOUND;
        case 500:
        case 502:
        case 503:
          return ERROR_MESSAGES.SERVER_ERROR;
        default:
          return ERROR_MESSAGES.UNKNOWN_ERROR;
      }
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Helper function to determine error code
function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object") {
    const apiError = error as any;
    return apiError.code || apiError.error?.name || apiError.status?.toString();
  }
  return undefined;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ErrorState | null>(null);

  const setError = useCallback((error: string | Error | null) => {
    if (!error) {
      setErrorState(null);
      return;
    }

    const message = getErrorMessage(error);
    const code = getErrorCode(error);
    
    setErrorState({
      message,
      code,
      details: error instanceof Error ? error.stack : error,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const message = customMessage || getErrorMessage(error);
    const code = getErrorCode(error);
    
    // Set error state
    setErrorState({
      message,
      code,
      details: error,
    });

    // Show toast notification
    toast.error(message, {
      duration: 5000,
      action: {
        label: "Dismiss",
        onClick: () => clearError(),
      },
    });

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error handled:", error);
    }
  }, [clearError]);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 4000,
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message, {
      duration: 4000,
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    toast.info(message, {
      duration: 4000,
    });
  }, []);

  return {
    error,
    isError: error !== null,
    setError,
    clearError,
    handleError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

export { ERROR_MESSAGES, getErrorMessage, getErrorCode };

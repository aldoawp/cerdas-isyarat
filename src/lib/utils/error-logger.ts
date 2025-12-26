import { insertErrorLog } from '@/repositories/error-log-repository';

/**
 * Severity levels for error logging
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Options for logging errors
 */
export interface LogErrorOptions {
  severity?: ErrorSeverity;
  module?: string;
  userId?: string;
  errorCode?: string;
  additionalContext?: Record<string, unknown>;
}

/**
 * Extract error details from an Error object or string
 */
const extractErrorDetails = (error: Error | string | unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      stack: undefined,
      name: 'Error',
    };
  }

  // Handle unknown error types
  return {
    message: String(error),
    stack: undefined,
    name: 'UnknownError',
  };
};

/**
 * Extract module and line number from stack trace
 */
const extractStackInfo = (stack?: string) => {
  if (!stack) return { module: undefined, lineNumber: undefined };

  // Try to extract the first meaningful line from the stack trace
  const lines = stack.split('\n');
  const relevantLine = lines.find(
    line =>
      line.includes('.ts') || line.includes('.tsx') || line.includes('.js')
  );

  if (!relevantLine) return { module: undefined, lineNumber: undefined };

  // Extract file path and line number
  // Example: "at functionName (file:///path/to/file.ts:123:45)"
  const fileMatch = relevantLine.match(/([^/\\]+\.(ts|tsx|js|jsx)):(\d+)/);
  if (fileMatch) {
    return {
      module: fileMatch[1], // filename with extension
      lineNumber: Number.parseInt(fileMatch[3], 10),
    };
  }

  return { module: undefined, lineNumber: undefined };
};

/**
 * Centralized error logging function
 *
 * @param error - The error to log (Error object, string, or unknown)
 * @param options - Additional options for error logging
 *
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (error) {
 *   await logError(error, {
 *     severity: 'high',
 *     module: 'auth-service',
 *     userId: user?.id
 *   });
 * }
 * ```
 */
export const logError = async (
  error: Error | string | unknown,
  options: LogErrorOptions = {}
): Promise<void> => {
  try {
    const { message, stack, name } = extractErrorDetails(error);
    const stackInfo = extractStackInfo(stack);

    // Merge stack info with provided options (options take precedence)
    const moduleName = options.module || stackInfo.module;
    const lineNumber = stackInfo.lineNumber;

    // Build context string if additional context is provided
    let finalMessage = message;
    if (options.additionalContext) {
      const contextStr = JSON.stringify(options.additionalContext);
      finalMessage = `${message} | Context: ${contextStr}`;
    }

    await insertErrorLog({
      error_code: options.errorCode || name,
      error_message: finalMessage,
      severity: options.severity || 'medium',
      stack_trace: stack,
      module: moduleName,
      line_number: lineNumber,
      actor_id: options.userId,
    });
  } catch (loggingError) {
    // Don't throw errors from error logging - just log to console
    console.error('Failed to log error to database:', loggingError);
    console.error('Original error:', error);
  }
};

/**
 * Log authentication-related errors
 */
export const logAuthError = async (
  error: Error | string | unknown,
  userId?: string
): Promise<void> => {
  await logError(error, {
    severity: 'high',
    module: 'authentication',
    userId,
  });
};

/**
 * Log database operation errors
 */
export const logDatabaseError = async (
  error: Error | string | unknown,
  options: Omit<LogErrorOptions, 'severity'> = {}
): Promise<void> => {
  await logError(error, {
    ...options,
    severity: 'high',
  });
};

/**
 * Log API/service errors
 */
export const logServiceError = async (
  error: Error | string | unknown,
  serviceName: string,
  userId?: string
): Promise<void> => {
  await logError(error, {
    severity: 'medium',
    module: serviceName,
    userId,
  });
};

/**
 * Log UI/component errors
 */
export const logUIError = async (
  error: Error | string | unknown,
  componentName: string,
  userId?: string
): Promise<void> => {
  await logError(error, {
    severity: 'low',
    module: componentName,
    userId,
  });
};

/**
 * Log critical errors that require immediate attention
 */
export const logCriticalError = async (
  error: Error | string | unknown,
  options: Omit<LogErrorOptions, 'severity'> = {}
): Promise<void> => {
  await logError(error, {
    ...options,
    severity: 'critical',
  });
};

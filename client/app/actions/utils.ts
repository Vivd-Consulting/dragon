/**
 * Server Actions utility functions
 */

export class ActionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ActionError';
  }
}

/**
 * Handle errors in server actions
 */
export function handleActionError(error: unknown): { error: string } {
  if (error instanceof ActionError) {
    return { error: error.message };
  }

  if (error instanceof Error) {
    console.error('Server Action Error:', error);
    return { error: error.message };
  }

  return { error: 'An unknown error occurred' };
}

/**
 * Validate required fields
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): void {
  const missing: string[] = [];

  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(String(field));
    }
  }

  if (missing.length > 0) {
    throw new ActionError(
      `Missing required fields: ${missing.join(', ')}`,
      'VALIDATION_ERROR'
    );
  }
}


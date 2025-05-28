import { StatusCodes } from "http-status-codes";

/**
 * Add more custom error classes as needed to represent different error scenarios.
 * These classes can be used to represent specific reponse error types in your API.
 */

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export function makeError<TError extends Error>(error: TError) {
  const defaultError = {
    success: false,
    message: error.message,
  };

  //* Custom Errors
  if (error.message.includes("Malformed JSON")) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: {
        message: error.message,
      },
    };
  }

  if (error instanceof BadRequestError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: defaultError,
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      error: defaultError,
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      error: defaultError,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      error: defaultError,
    };
  }

  if (error instanceof InternalServerError) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: defaultError,
    };
  }

  // Default case for unhandled errors
  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    error: defaultError,
  };
}

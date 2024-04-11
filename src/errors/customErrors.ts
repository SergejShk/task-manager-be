class CustomError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.status = 400;
  }
}

class InvalidParameterError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.status = 422;
  }
}

class RefreshTokenError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.status = 403;
  }
}

class UnauthorizedError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.status = 401;
  }
}

class DuplicateError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.status = 409;
  }
}

export {
  CustomError,
  InvalidParameterError,
  RefreshTokenError,
  UnauthorizedError,
  DuplicateError,
};

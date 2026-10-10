export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "EVENT_FULL"
  | "EVENT_PASSED"
  | "ALREADY_REGISTERED"
  | "NOT_REGISTERED"
  | "CAPACITY_BELOW_REGISTRATIONS"
  | "EMAIL_TAKEN";

const statusByCode: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  EVENT_FULL: 409,
  EVENT_PASSED: 409,
  ALREADY_REGISTERED: 409,
  NOT_REGISTERED: 409,
  CAPACITY_BELOW_REGISTRATIONS: 409,
  EMAIL_TAKEN: 409,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(code: ErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = statusByCode[code];
    this.fields = fields;
  }
}

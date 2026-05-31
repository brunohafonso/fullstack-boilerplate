import httpStatus from 'http-status-codes';

export const ErrorCodes = {
	MISSING_OR_INVALID_PARAMETERS: 'MISSING_OR_INVALID_PARAMETERS',
} as const;

export interface IValidationError {
	fieldName: string;
	friendlyFieldName: string;
	message: string;
}

export class HttpError extends Error {
	constructor(
		public description: string,
		public status: number,
		public code: string,
		public isOperational: boolean,
	) {
		super(description);
		this.name = this.constructor.name;
	}
}

export class BadRequestError extends HttpError {
	constructor(description: string, code: string) {
		super(description, httpStatus.BAD_REQUEST, code, true);
	}
}

export class NotFoundError extends HttpError {
	constructor(description: string, code: string) {
		super(description, httpStatus.NOT_FOUND, code, true);
	}
}

export class InternalServerError extends HttpError {
	constructor(description: string, code: string) {
		super(description, httpStatus.INTERNAL_SERVER_ERROR, code, false);
	}
}

export class ValidationError extends HttpError {
	constructor(
		public validationErrors: IValidationError[],
		code: string,
	) {
		super('Validation failed', httpStatus.BAD_REQUEST, code, true);
	}
}

import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { HttpError, ValidationError } from '../shared/errors';
import type { ILogger } from '../shared/types';

export function errorHandler(logger: ILogger) {
	return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
		if (err instanceof HttpError) {
			if (err.isOperational) {
				logger.warn('operational error', { code: err.code, status: err.status, description: err.description });

				const body: Record<string, unknown> = { message: err.description, code: err.code };

				res.status(err.status).json({
					...body,
					...(err instanceof ValidationError ? { validationErrors: err.validationErrors } : {}),
				});
				return;
			}

			logger.error('non-operational http error', err, { code: err.code, status: err.status });
		} else {
			logger.error('unexpected error', err instanceof Error ? err : new Error(String(err)));
		}

		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
	};
}

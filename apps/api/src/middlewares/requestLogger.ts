import type { NextFunction, Request, Response } from 'express';

import type { ILogger } from '../shared/types';

export function requestLogger(logger: ILogger) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const start = Date.now();

		res.on('finish', () => {
			logger.info('request completed', {
				method: req.method,
				url: req.originalUrl,
				status: res.statusCode,
				durationMs: Date.now() - start,
			});
		});

		next();
	};
}

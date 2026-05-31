import pino from 'pino';

import type { ILogger, LogContext } from './types';

export class Logger implements ILogger {
	private static instance: Logger;
	private readonly pino = pino({ name: 'api' });

	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}

		return this.instance;
	}

	info(msg: string, context?: LogContext): void {
		this.pino.info(context ?? {}, msg);
	}

	warn(msg: string, context?: LogContext): void {
		this.pino.warn(context ?? {}, msg);
	}

	error(msg: string, err?: Error, context?: LogContext): void {
		this.pino.error({ err, ...context }, msg);
	}
}

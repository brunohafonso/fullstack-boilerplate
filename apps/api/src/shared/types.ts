export enum ExitStatus {
	SUCCESS = 0,
	FAILURE = 1,
}

export type LogContext = Record<string, unknown>;

export interface ILogger {
	info(msg: string, context?: LogContext): void;
	warn(msg: string, context?: LogContext): void;
	error(msg: string, err?: Error, context?: LogContext): void;
}

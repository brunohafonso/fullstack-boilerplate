import { App } from './App';
import { Logger } from './shared/logger';
import { ExitStatus } from './shared/types';

const logger = Logger.getInstance();

function handleExitSignal(signal: NodeJS.Signals, appInstance: App): void {
	process.on(signal, async () => {
		try {
			await appInstance.stopApplication();
			logger.info('app exited with success');
			process.exit(ExitStatus.SUCCESS);
		} catch (error) {
			if (error instanceof Error) {
				logger.error(`error exiting application: ${error.message}`, error);
			} else {
				logger.error('error exiting application');
			}
			process.exit(ExitStatus.FAILURE);
		}
	});
}

(async () => {
	try {
		const app = new App();
		await app.initApplication();
		app.initServer();

		const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
		exitSignals.forEach(signal => handleExitSignal(signal, app));
	} catch (error) {
		if (error instanceof Error) {
			logger.error(`error initializing application: ${error.message}`, error);
		} else {
			logger.error('error initializing application');
		}
		process.exit(ExitStatus.FAILURE);
	}
})();

process.on('uncaughtException', (error: Error) => {
	logger.error(`uncaughtException - ${error.message}`, error);
	process.exit(ExitStatus.FAILURE);
});

process.on('unhandledRejection', (reason: unknown) => {
	if (reason instanceof Error) {
		logger.error(`unhandledRejection - ${reason.message}`, reason);
		throw reason;
	}
	logger.error('unhandledRejection - unknown reason');
	process.exit(ExitStatus.FAILURE);
});

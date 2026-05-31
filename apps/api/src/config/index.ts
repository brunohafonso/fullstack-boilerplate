export interface AppConfig {
	port: string;
	nodeEnv: string;
	databaseUrl: string;
}

const REQUIRED_ENV_VARS = ['PORT', 'NODE_ENV', 'DATABASE_URL'] as const;

export function validateEnvironmentVariables(): AppConfig {
	const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}

	return {
		port: process.env['PORT'] as string,
		nodeEnv: process.env['NODE_ENV'] as string,
		databaseUrl: process.env['DATABASE_URL'] as string,
	};
}

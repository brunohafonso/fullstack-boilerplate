import { createRequire } from 'module';

import { HealthcheckController } from './controller';
import { HealthcheckRouter } from './router';
import { HealthcheckService } from './service';

const require = createRequire(import.meta.url);
const pkg = require('../../../package.json') as { name: string; version: string };

export function createHealthcheckRouter(): HealthcheckRouter {
	const service = new HealthcheckService(pkg.name, pkg.version);
	const controller = new HealthcheckController(service);
	return new HealthcheckRouter(controller);
}

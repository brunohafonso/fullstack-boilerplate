import { UsersController } from './controller';
import { UsersRouter } from './router';
import { UsersService } from './service';

export function createUsersRouter(): UsersRouter {
	const service = new UsersService();
	const controller = new UsersController(service);
	return new UsersRouter(controller);
}

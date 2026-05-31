import Joi from 'joi';

export const getUserByIdSchema = {
	params: Joi.object({ id: Joi.number().integer().positive().required() }),
};

export const createUserSchema = {
	body: Joi.object({
		name: Joi.string().optional(),
		email: Joi.string().email().required(),
	}),
};

export const updateUserSchema = {
	params: Joi.object({ id: Joi.number().integer().positive().required() }),
	body: Joi.object({
		name: Joi.string(),
		email: Joi.string().email(),
	}),
};

export const deleteUserSchema = {
	params: Joi.object({ id: Joi.number().integer().positive().required() }),
};

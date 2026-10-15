import type { z } from 'zod';
import type { UserCreate as UserCreateModel } from '#lib/generated-client/index.js';
import { UserCreate } from '#lib/generated-client/zod.gen.js';

export const schema = UserCreate.refine((data) => data.confirm_password === data.password, {
	message: "passwords don't match",
	path: ['confirm_password']
});

({}) as z.infer<typeof schema> satisfies UserCreateModel;

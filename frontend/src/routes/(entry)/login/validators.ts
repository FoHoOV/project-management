import { z } from 'zod';
import { Body_login_for_access_token_OAuth, UserCreate } from '#lib/generated-client/zod.gen.js';

export const schema = z.object({
	username: UserCreate.shape.username,
	password: UserCreate.shape.password
});

({}) as z.infer<typeof schema> satisfies z.input<typeof Body_login_for_access_token_OAuth>;

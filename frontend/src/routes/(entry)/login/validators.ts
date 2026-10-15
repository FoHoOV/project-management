import { z } from 'zod';
import {
	UserCreate,
	type Body_login_for_access_token_OAuth
} from '$lib/generated-client/zod/schemas';

export const schema = z.object({
	username: UserCreate.shape.username,
	password: UserCreate.shape.password
});

({}) as z.infer<typeof schema> satisfies z.input<typeof Body_login_for_access_token_OAuth>;

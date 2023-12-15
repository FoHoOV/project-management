import { z } from 'zod';
import type { Body_login_for_access_token_OAuth } from '$lib/generated-client/zod/schemas';

export const schema = z.object({
	username: z.string().min(3).max(30),
	password: z.string().min(5).max(100)
});

({}) as z.infer<typeof schema> satisfies Body_login_for_access_token_OAuth;

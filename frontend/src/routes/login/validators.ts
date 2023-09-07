import { z } from 'zod';
import type { Body_login_for_access_token } from '$lib/client/zod/schemas';

export const schema = z.object({
	username: z.string().nonempty().min(5).max(15),
	password: z.string().nonempty().min(5).max(50)
});

({}) as z.infer<typeof schema> satisfies Body_login_for_access_token;

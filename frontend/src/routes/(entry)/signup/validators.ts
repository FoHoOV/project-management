import { z } from 'zod';
import type { UserCreate } from '$lib/generated-client';

export const schema = z
	.object({
		username: z.string().min(3).max(30),
		password: z.string().min(5).max(100),
		confirm_password: z.string().min(5).max(100)
	})
	.refine((data) => data.confirm_password === data.password, {
		message: "passwords don't match",
		path: ['confirm_password']
	});

({}) as z.infer<typeof schema> satisfies UserCreate;

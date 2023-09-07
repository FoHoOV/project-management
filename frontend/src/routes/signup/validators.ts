import { z } from 'zod';
import type { UserCreate } from '$lib/client';

export const schema = z.object({
	username: z.string().nonempty().min(5).max(10),
	password: z.string().nonempty().min(5).max(10),
	confirm_password: z.string().nonempty().min(5).max(10)
}).refine((data) => data.confirm_password === data.password, {message: "passwords don't match", path: ["confirm_password"]});


({}) as z.infer<typeof schema> satisfies UserCreate;
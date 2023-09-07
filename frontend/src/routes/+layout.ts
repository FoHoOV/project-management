import type { LayoutLoad } from './$types';

export const ssr = true;

export const load = (async ({ data }) => {
	// this does not work because on the first load we set this function to be undefined
	// since redirecting to todos page does not trigger this load function on the server side
	// we will have undefined until we do a hard refresh
	// thats why where we set the token for the server should be in hooks.server.ts
	// OpenAPI.TOKEN = async () => {
	// 	return data?.token?.access_token ?? '';
	// };
	return { token: data?.token };
}) satisfies LayoutLoad;

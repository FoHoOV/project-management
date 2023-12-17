import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ status }) => {
	return {
		message: 'Whoops! an unknown error has occurred, please try again later',
		status: status
	};
};

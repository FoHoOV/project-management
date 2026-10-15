import type { HandleClientError } from '@sveltejs/kit/hooks';

export const handleError: HandleClientError = ({ kind }) => {
	if (kind === 'unknown') {
		return { message: 'Whoops! an unknown error has occurred, please try again later' };
	}
};

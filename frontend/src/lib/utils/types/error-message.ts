export type ErrorMessage =
	| 'Invalid form, please review your inputs'
	| 'An unknown error has occurred, please try again'
	| 'Unauthorized, token has expired.'
	| (string & {});

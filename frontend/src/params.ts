import { defineParams } from '@sveltejs/kit/params';

const matchInteger = (param: string) => {
	return /^\d+$/.test(param);
};

const matchName = (param: string) => {
	return /^([a-zA-Z])+$/.test(param);
};

export const params = defineParams({
	integer: (param) => (matchInteger(param) ? param : undefined),
	name: (param) => (matchName(param) ? param : undefined)
});

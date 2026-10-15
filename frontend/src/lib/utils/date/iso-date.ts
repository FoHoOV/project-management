/**
 * Calendar dates (e.g. due dates) travel as `YYYY-MM-DD` strings. Converting them with
 * `new Date('YYYY-MM-DD')` would read them as UTC midnight, which is the previous day west of UTC.
 */
export function toIsoDate(date: Date) {
	const pad = (value: number) => value.toString().padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromIsoDate(isoDate: string) {
	const [year, month, day] = isoDate.split('-').map(Number);
	return new Date(year, month - 1, day);
}

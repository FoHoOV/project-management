// TODO: how in the actual wizardry does this work?
export type Enumerate<Start extends number, End extends number[] = []> = End['length'] extends Start
	? End[number]
	: Enumerate<Start, [...End, End['length']]>;

export type NumberRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

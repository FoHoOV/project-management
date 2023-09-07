export type RequiredProperty<Type, Key extends keyof Type> = Omit<Type, Key> &
	Required<Pick<Type, Key>>;

export type OptionalProperty<Type, Key extends keyof Type> = Omit<Type, Key> &
	Partial<Pick<Type, Key>>;

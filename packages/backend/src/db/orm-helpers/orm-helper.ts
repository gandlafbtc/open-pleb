export const takeUniqueOrThrow = <T extends unknown[]>(
	values: T,
): T[number] => {
	if (values.length !== 1)
		throw new Error("Found non unique or inexistent value");
	return values[0];
};

export const takeUniqueOrUndefinded = <T extends unknown[]>(
	values: T,
): T[number] | undefined => {
	if (values.length !== 1) return undefined;
	return values[0];
};

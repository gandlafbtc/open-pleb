import { expect, test } from "bun:test";
import { getAmountsForAmount } from "../src/util";

test("2 + 2", () => {
	expect(2 + 2).toBe(4);
});

test("test amounts for amount", () => {
	const amounts = [
		2147483648, 1073741824, 536870912, 268435456, 134217728, 67108864, 33554432,
		16777216, 8388608, 4194304, 2097152, 1048576, 524288, 262144, 131072, 65536,
		32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1,
	];
	const amount1 = 2;
	const amounts1 = getAmountsForAmount(amount1, amounts);
	expect(amounts1).toEqual([2]);

	const amount2 = 5;
	const amounts2 = getAmountsForAmount(amount2, amounts);
	expect(amounts2).toEqual([4, 1]);

	const amount3 = 31;
	const amounts3 = getAmountsForAmount(amount3, amounts);
	expect(amounts3).toEqual([16, 8, 4, 2, 1]);
});

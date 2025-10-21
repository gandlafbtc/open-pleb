import type { Proof } from "@cashu/cashu-ts";
import type { Secret } from "@cashu/crypto/modules/common";

export const getAmountForTokenSet = (tokens: Array<Proof>): number => {
	return tokens.reduce((acc, t) => {
		return acc + t.amount;
	}, 0);
};

export const parseSecret = (secret: string | Uint8Array): Secret => {
	try {
		let internalSecret = secret;
		if (internalSecret instanceof Uint8Array) {
			internalSecret = new TextDecoder().decode(internalSecret);
		}
		return JSON.parse(internalSecret);
	} catch (e) {
		throw new Error("can't parse secret");
	}
};

export const getAproxAmount = (
	amount: number,
	proofs: Proof[],
): Proof[] | undefined => {
	const proofsClone = [...proofs];

	const exactProofs: Proof[] = [];
	let lastClosest: Proof[] = [];

	for (let i = 0; i < 2; i++) {
		const sorted = proofsClone.sort((a, b) => b.amount - a.amount);
		while (getAmountForTokenSet(exactProofs) < amount) {
			const next = sorted.shift();
			if (!next) {
				break;
			}
			if (exactProofs.find((p) => p.secret === next.secret)) {
				continue;
			}

			if (getAmountForTokenSet(exactProofs) + next.amount <= amount) {
				exactProofs.push(next);
			} else {
				lastClosest = [next];
			}
			if (getAmountForTokenSet(exactProofs) === amount) {
				return exactProofs;
			}
		}
	}
	for (let i = 0; i < exactProofs.length; i++) {
		if (
			getAmountForTokenSet(exactProofs) +
				getAmountForTokenSet(lastClosest) -
				getAmountForTokenSet([exactProofs[i]]) >=
			amount
		) {
			// BUG? should this not be splice(i,1)
			exactProofs.splice(i);
			i--;
		}
	}

	if (
		amount >
		getAmountForTokenSet(exactProofs) + getAmountForTokenSet(lastClosest)
	) {
		return [];
	}
	return [...exactProofs, ...lastClosest];
};

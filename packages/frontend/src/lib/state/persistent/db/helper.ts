import { bytesToHex, randomBytes } from '@noble/hashes/utils';

export const randDBKey = () => {
	return bytesToHex(randomBytes(8));
};

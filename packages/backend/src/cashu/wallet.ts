import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { mnemonicToSeed } from "@scure/bip39";

const mint = new CashuMint(Bun.env.OPENPLEB_MINT_URL!);
export const wallet = new CashuWallet(mint, {
	bip39seed: await mnemonicToSeed(Bun.env.CASHU_SEED_PHRASE!),
});

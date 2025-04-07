import { CashuMint, CashuWallet } from "@cashu/cashu-ts";

const mint = new CashuMint(Bun.env.PUBLIC_MINT_URL!); // Create a new mint instance
export const wallet = new CashuWallet(mint);  // Create a new wallet instance

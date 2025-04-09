import { CashuMint, CashuWallet } from "@cashu/cashu-ts";

const mint = new CashuMint(Bun.env.PUBLIC_MINT_URL!); 
export const wallet = new CashuWallet(mint); 

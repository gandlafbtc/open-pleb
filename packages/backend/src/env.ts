export const environment = {
	OPENPLEB_PLATFORM_FEE_PERCENTAGE: Number.parseInt(Bun.env.OPENPLEB_PLATFORM_FEE_PERCENTAGE),
	OPENPLEB_PLATFORM_FEE_FLAT_RATE: Number.parseInt(Bun.env.OPENPLEB_PLATFORM_FEE_FLAT_RATE),
	OPENPLEB_TAKER_FEE_PERCENTAGE: Number.parseInt(Bun.env.OPENPLEB_TAKER_FEE_PERCENTAGE),
	OPENPLEB_TAKER_FEE_FLAT_RATE: Number.parseInt(Bun.env.OPENPLEB_TAKER_FEE_FLAT_RATE),
	OPENPLEB_BOND_PERCENTAGE: Number.parseInt(Bun.env.OPENPLEB_BOND_PERCENTAGE),
	OPENPLEB_BOND_FLAT_RATE:Number.parseInt(Bun.env.OPENPLEB_BOND_FLAT_RATE),
	OPENPLEB_CURRENCY: Bun.env.OPENPLEB_CURRENCY,
	OPENPLEB_MAX_FIAT_AMOUNT:Number.parseInt(Bun.env.OPENPLEB_MAX_FIAT_AMOUNT),
	OPENPLEB_MINT_URL: Bun.env.OPENPLEB_MINT_URL
}

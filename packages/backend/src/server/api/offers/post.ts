import { getConversionRate } from "@openPleb/common/conversion";
import { createOffer } from "../../../business/createOffer";

export const postOffer = async (body: {
	amount: number;
	qrCode: string;
	pubkey: string;
}) => {
	const { amount, qrCode, pubkey } = body;

	if (!amount || !qrCode || !pubkey) {
		return new Response("Invalid request", {
			status: 400,
		});
	}
	if (amount <= 0) {
		return new Response("Invalid amount", {
			status: 400,
		});
	}
	if (amount > Number.parseInt(Bun.env.PUBLIC_MAX_FIAT_AMOUNT!)) {
		return new Response("Amount exceeds maximum allowed", {
			status: 400,
		});
	}

	const conversionRate = await getConversionRate();

	if (!conversionRate) {
		return new Response("Could not fetch conversion rate", {
			status: 500,
		});
	}

	const offer = await createOffer({
		amount,
		qrCode,
		pubkey,
		conversionRate,
	});

	return { offer };
};

import { getAppApiBaseUrl } from "./const";

export interface CreateOfferRequest {
	sessionId: string;
	fiatAmount: number;
	fiatProviderId: number | null;
	fiatAddress: string;
	description?: string;
}

export interface CreateOfferResponse {
	success: boolean;
	offer?: {
		id: number;
		status: string;
		fiatCurrency: string;
		fiatAmount: number;
		fiatProviderId: number | null;
		fiatAddress: string;
		conversionRate: number;
		satsAmount: number;
		platformFeeFlatRate: number;
		platformFeePercentage: number;
		takerFeeFlatRate: number;
		takerFeePercentage: number;
		makerBondFlatRate: number;
		makerBondPercentage: number;
		takerBondFlatRate: number;
		takerBondPercentage: number;
		makerSessionId: string;
		updatedAt: number;
		expiresAt: number;
		description: string | null;
		receiptImg: string;
	};
	error?: string;
}

/**
 * Create a new offer
 */
export async function createOffer(request: CreateOfferRequest): Promise<CreateOfferResponse> {
	const response = await fetch(`${getAppApiBaseUrl()}/offer`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to create offer");
	}

	return response.json();
}

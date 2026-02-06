import { RoomIds } from "common/ws-types";
import { log } from "../../../../../util/logger";
import type { ServerWebSocket } from "bun";
import type { WSData } from "../types";

export type AuthCheckFn = (
    ws: ServerWebSocket<WSData>,
    roomId: string,
    auth: {bat?:string}
) => Promise<boolean>;

// TODO: Implement actual BAT verification
async function verifyBATForOffer(bat: string, offerId: string): Promise<boolean> {
	// Placeholder: Verify that the BAT is valid for this specific offer
	// The BAT should prove the user is either the maker or taker without revealing which
	log.warn(`BAT verification not yet implemented for offer ${offerId}`);
	return false; // TODO: Replace with actual verification
}

export const AuthChecks = {
	// Offer room: Only maker and taker can subscribe
	// BAT proves they're one of the parties without revealing which
	offer: async (_ws, roomId, auth) => {
		if (!auth?.bat) {
			log.warn(`No BAT provided for offer room: ${roomId}`);
			return false;
		}
		
		try {
			const offerId = RoomIds.extractOfferId(roomId);
			return await verifyBATForOffer(auth.bat, offerId);
		} catch (error) {
			log.error(`Error verifying BAT for offer room: ${error}`);
			return false;
		}
	},
	
	// Global room: Anyone can subscribe (no auth needed)
	global: async () => true,
	
} satisfies Record<string, AuthCheckFn>;

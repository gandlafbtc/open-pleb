import { RoomIds } from "common/ws-types";
import { log } from "../../../../../util/logger";
import type { ServerWebSocket } from "bun";
import type { WSData } from "../types";
import * as sessionRepository from "../../../../../repository/app/session.repository";
import * as offerRepository from "../../../../../repository/app/offer.repository";

export type AuthCheckFn = (
    ws: ServerWebSocket<WSData>,
    roomId: string,
    auth: {bat?:string}
) => Promise<boolean>;

/**
 * Verify that the session ID is valid, not expired, and matches the offer
 */
async function verifySessionForOffer(sessionId: string, offerId: number): Promise<boolean> {
	try {
		// Get session from database
		const session = await sessionRepository.getSessionById(sessionId);
		
		if (!session) {
			log.warn(`Session not found: ${sessionId}`);
			return false;
		}
		
		// Check if session is expired
		if (session.expiresAt && session.expiresAt < Math.floor(Date.now() / 1000)) {
			log.warn(`Session expired: ${sessionId}`);
			return false;
		}
		
		// Get offer from database
		const offer = await offerRepository.getOfferById(offerId);
		
		if (!offer) {
			log.warn(`Offer not found: ${offerId}`);
			return false;
		}
		
		// Check if session matches either maker or taker
		if (offer.makerSessionId !== sessionId && offer.takerSessionId !== sessionId) {
			log.warn(`Session ${sessionId} not authorized for offer ${offerId}`);
			return false;
		}
		
		// Session is valid and authorized
		log.info(`Session verified for offer ${offerId}: ${sessionId}`);
		return true;
	} catch (error) {
		log.error(`Error verifying session: ${error}`);
		return false;
	}
}

export const AuthChecks = {
	// Offer room: Only maker and taker can subscribe
	// Session ID proves they're one of the parties without revealing which
	offer: async (_ws, roomId, auth) => {
		if (!auth?.bat) {
			log.warn(`No session ID provided for offer room: ${roomId}`);
			return false;
		}
		
		try {
			const offerIdStr = RoomIds.extractOfferId(roomId);
			const offerId = parseInt(offerIdStr);
			
			if (isNaN(offerId)) {
				log.warn(`Invalid offer ID: ${offerIdStr}`);
				return false;
			}
			
			// auth.bat contains the session ID
			return await verifySessionForOffer(auth.bat, offerId);
		} catch (error) {
			log.error(`Error verifying session for offer room: ${error}`);
			return false;
		}
	},
	
	// Global room: Anyone can subscribe (no auth needed)
	global: async () => true,
	
} satisfies Record<string, AuthCheckFn>;

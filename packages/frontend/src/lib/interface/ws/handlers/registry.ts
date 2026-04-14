/**
 * Client-side message handler registry
 * Manages handlers for different server message types
 */

import { 
	WS_COMMAND, 
	type PongData, 
	type SubscribedData,
	type UnsubscribedData,
	type ErrorData,
	type WSMessage, 
	type OfferUpdatedData,
	type OfferListedData
} from "common/ws-types";
import type {
	PongHandler,
	SubscribedHandler,
	UnsubscribedHandler,
	ErrorHandler,
	UpdateHandler,
	OfferListedHandler
} from "../types";

export class MessageHandlerRegistry {
	private pongHandlers = new Set<PongHandler>();
	private subscribedHandlers = new Set<SubscribedHandler>();
	private unsubscribedHandlers = new Set<UnsubscribedHandler>();
	private errorHandlers = new Set<ErrorHandler>();
	private updateHandlers = new Set<UpdateHandler>();
	private offerListedHandlers = new Set<OfferListedHandler>();

	/**
	 * Handle incoming server message
	 */
	handle(message: WSMessage): void {
		switch (message.type) {
			case WS_COMMAND.PONG: {
				const payload = message.data as PongData;
				this.pongHandlers.forEach(handler => {
					try {
						handler(payload);
					} catch (error) {
						console.error("Error in pong handler:", error);
					}
				});
				break;
			}

			case WS_COMMAND.SUBSCRIBED: {
				const payload = message.data as SubscribedData;
				this.subscribedHandlers.forEach(handler => {
					try {
						handler(payload);
					} catch (error) {
						console.error("Error in subscribed handler:", error);
					}
				});
				break;
			}

			case WS_COMMAND.UNSUBSCRIBED: {
				const payload = message.data as UnsubscribedData;
				this.unsubscribedHandlers.forEach(handler => {
					try {
						handler(payload);
					} catch (error) {
						console.error("Error in unsubscribed handler:", error);
					}
				});
				break;
			}

			case WS_COMMAND.ERROR: {
				const payload = message.data as ErrorData;
				this.errorHandlers.forEach(handler => {
					try {
						handler(payload);
					} catch (error) {
						console.error("Error in error handler:", error);
					}
				});
				break;
			}

			// Handle all offer events as updates
			case WS_COMMAND.OFFER_UPDATED:
			case WS_COMMAND.OFFER_CREATED:
			case WS_COMMAND.OFFER_CLAIMED:
			case WS_COMMAND.OFFER_COMPLETED:
			case WS_COMMAND.OFFER_DISPUTED:
			case WS_COMMAND.OFFER_RESOLVED: {
				const payload = message.data as OfferUpdatedData;
				this.updateHandlers.forEach(handler => {
					try {
						handler(payload);
					} catch (error) {
						console.error("Error in update handler:", error);
					}
				});
				break;
			}

			case WS_COMMAND.OFFER_LISTED: {
				const payload = message.data as OfferListedData;
				this.offerListedHandlers.forEach(handler => {
					try {
						handler(payload);
					} catch (error) {
						console.error("Error in offer listed handler:", error);
					}
				});
				break;
			}

			default:
				console.warn("Unknown message type:", message.type);
		}
	}

	/**
	 * Register handlers
	 */
	onPong(handler: PongHandler): () => void {
		this.pongHandlers.add(handler);
		return () => this.pongHandlers.delete(handler);
	}

	onSubscribed(handler: SubscribedHandler): () => void {
		this.subscribedHandlers.add(handler);
		return () => this.subscribedHandlers.delete(handler);
	}

	onUnsubscribed(handler: UnsubscribedHandler): () => void {
		this.unsubscribedHandlers.add(handler);
		return () => this.unsubscribedHandlers.delete(handler);
	}

	onError(handler: ErrorHandler): () => void {
		this.errorHandlers.add(handler);
		return () => this.errorHandlers.delete(handler);
	}

	onUpdate(handler: UpdateHandler): () => void {
		this.updateHandlers.add(handler);
		return () => this.updateHandlers.delete(handler);
	}

	onOfferListed(handler: OfferListedHandler): () => void {
		this.offerListedHandlers.add(handler);
		return () => this.offerListedHandlers.delete(handler);
	}

	/**
	 * Clear all handlers
	 */
	clear(): void {
		this.pongHandlers.clear();
		this.subscribedHandlers.clear();
		this.unsubscribedHandlers.clear();
		this.errorHandlers.clear();
		this.updateHandlers.clear();
		this.offerListedHandlers.clear();
	}
}

// WebSocket Message Types and Constants

// ============================================================================
// Constants (using object literals for consistency with existing codebase)
// ============================================================================

export const WS_COMMAND = {
	// Connection
	PING: 'ping',
	PONG: 'pong',
	
	// Subscriptions
	SUBSCRIBE: 'subscribe',
	UNSUBSCRIBE: 'unsubscribe',
	SUBSCRIBED: 'subscribed',
	UNSUBSCRIBED: 'unsubscribed',
	
	// Events (server -> client)
	OFFER_UPDATED: 'offer:updated',
	OFFER_CREATED: 'offer:created',
	OFFER_LISTED: 'offer:listed',
	OFFER_CLAIMED: 'offer:claimed',
	OFFER_COMPLETED: 'offer:completed',
	OFFER_DISPUTED: 'offer:disputed',
	OFFER_RESOLVED: 'offer:resolved',
	
	// Errors
	ERROR: 'error',
} as const;

export type WSCommand = typeof WS_COMMAND[keyof typeof WS_COMMAND];

export const WS_ERROR_CODE = {
	// Auth errors
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	INVALID_TOKEN: 'INVALID_TOKEN',
	
	// Validation errors
	INVALID_MESSAGE: 'INVALID_MESSAGE',
	MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
	INVALID_ROOM_ID: 'INVALID_ROOM_ID',
	
	// Business logic errors
	ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
	ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',
	NOT_SUBSCRIBED: 'NOT_SUBSCRIBED',
	
	// Server errors
	INTERNAL_ERROR: 'INTERNAL_ERROR',
	HANDLER_NOT_FOUND: 'HANDLER_NOT_FOUND',
} as const;

export type WSErrorCode = typeof WS_ERROR_CODE[keyof typeof WS_ERROR_CODE];

export const ROOM_TYPE = {
	OFFER: 'offer',
	GLOBAL: 'global',
	ADMIN: 'admin',
} as const;

export type RoomType = typeof ROOM_TYPE[keyof typeof ROOM_TYPE];

// ============================================================================
// Command Data Types
// ============================================================================

export interface SubscribeData {
	room: string;
}

export interface UnsubscribeData {
	room: string;
}

export interface SubscribedData {
	room: string;
	timestamp: number;
}

export interface UnsubscribedData {
	room: string;
	timestamp: number;
}

export interface PingData {
	timestamp?: number;
}

export interface PongData {
	timestamp: number;
	clientTimestamp?: number;
}

export interface SubscriptionsData {
	rooms: string[];
	timestamp: number;
}

export interface OfferUpdatedData {
	offerId: string;
	state: string;
	timestamp: number;
	details?: Record<string, unknown>;
}

export interface OfferCreatedData {
	offerId: string;
	amount: number;
	currency: string;
	timestamp: number;
}

export interface OfferListedData {
	offer: import('./types').PublicOffer;
	timestamp: number;
}

export interface ErrorData {
	code: WSErrorCode;
	message: string;
	details?: Record<string, unknown>;
	requestType?: string;
}

// Union type for all possible WebSocket data payloads
export type WSData = 
	| SubscribeData
	| UnsubscribeData
	| SubscribedData
	| UnsubscribedData
	| PingData
	| PongData
	| SubscriptionsData
	| OfferUpdatedData
	| OfferCreatedData
	| OfferListedData
	| ErrorData;

// ============================================================================
// Message Interfaces
// ============================================================================

export interface WSMessage<T extends WSData = WSData> {
	type: string;
	data: T;
}

export interface WSClientMessage<T extends WSData = WSData> extends WSMessage<T> {
	auth?: {
		bat?: string;
		jwt?: string;
	};
}

export interface WSErrorResponse {
	type: 'error';
	data: ErrorData;
}

// ============================================================================
// Room Utilities
// ============================================================================

export const RoomIds = {
	offer: (offerId: string) => `offer:${offerId}`,
	global: () => 'global',
	admin: () => 'admin',
	
	parseType: (roomId: string): RoomType => {
		if (roomId === 'global') return ROOM_TYPE.GLOBAL;
		if (roomId === 'admin') return ROOM_TYPE.ADMIN;
		if (roomId.startsWith('offer:')) return ROOM_TYPE.OFFER;
		throw new Error(`Invalid room ID: ${roomId}`);
	},
	
	extractOfferId: (roomId: string): string => {
		if (!roomId.startsWith('offer:')) {
			throw new Error(`Not an offer room: ${roomId}`);
		}
		return roomId.replace('offer:', '');
	},
};

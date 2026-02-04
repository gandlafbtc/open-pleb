/**
 * WebSocket types for the backend
 * This file contains backend-specific types that extend or complement the common types
 */

import type { ServerWebSocket } from "bun";
import type { WSClientMessage } from "common/ws-types";

/**
 * Extended WebSocket with custom data
 */
export interface ExtendedWebSocket extends ServerWebSocket<any> {
	// Add any custom properties here if needed
	userId?: string;
	isAdmin?: boolean;
}

/**
 * WebSocket connection context
 */
export interface WSContext {
	ws: ServerWebSocket<any>;
	userId?: string;
	isAdmin?: boolean;
	connectedAt: number;
}

/**
 * Re-export common types for convenience
 */
export type {
	WSClientMessage,
	SubscribeData,
	UnsubscribeData,
	PingData,
	PongData,
	SubscribedData,
	UnsubscribedData,
	ErrorData
} from "common/ws-types";

export { WS_COMMAND, WS_ERROR_CODE } from "common/ws-types";

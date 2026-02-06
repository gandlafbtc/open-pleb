import { WSError } from "../errors/handler";
import { WS_ERROR_CODE, type WSClientMessage } from "common/ws-types";

/**
 * Message validation middleware
 * Validates the structure and content of WebSocket messages
 */

/**
 * Validate that a message has the required structure
 */
export function validateMessageStructure(message: unknown): message is WSClientMessage {
	if (!message || typeof message !== 'object') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Message must be an object"
		);
	}
	
	const msg = message as Record<string, unknown>;
	
	if (!msg.type || typeof msg.type !== 'string') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Message must have a 'type' field of type string"
		);
	}
	
	if (!msg.data || typeof msg.data !== 'object') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Message must have a 'data' field of type object"
		);
	}
	
	return true;
}

/**
 * Validate subscribe message data
 */
export function validateSubscribeData(data: unknown): void {
	if (!data || typeof data !== 'object') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Data must be an object"
		);
	}
	
	const d = data as Record<string, unknown>;
	
	if (!d.room || typeof d.room !== 'string') {
		throw new WSError(
			WS_ERROR_CODE.MISSING_REQUIRED_FIELD,
			"Subscribe message must have a 'room' field of type string"
		);
	}
	
	if (d.room.length === 0) {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Room name cannot be empty"
		);
	}
}

/**
 * Validate unsubscribe message data
 */
export function validateUnsubscribeData(data: unknown): void {
	if (!data || typeof data !== 'object') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Data must be an object"
		);
	}
	
	const d = data as Record<string, unknown>;
	
	if (!d.room || typeof d.room !== 'string') {
		throw new WSError(
			WS_ERROR_CODE.MISSING_REQUIRED_FIELD,
			"Unsubscribe message must have a 'room' field of type string"
		);
	}
	
	if (d.room.length === 0) {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Room name cannot be empty"
		);
	}
}

/**
 * Validate ping message data (optional timestamp)
 */
export function validatePingData(data: unknown): void {
	if (!data || typeof data !== 'object') {
		return; // Ping data is optional
	}
	
	const d = data as Record<string, unknown>;
	
	if (d.timestamp !== undefined && typeof d.timestamp !== 'number') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Ping timestamp must be a number if provided"
		);
	}
}

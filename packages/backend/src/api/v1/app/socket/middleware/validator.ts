import { WSError } from "../errors/handler";
import { WS_ERROR_CODE, type WSClientMessage } from "common/ws-types";

/**
 * Message validation middleware
 * Validates the structure and content of WebSocket messages
 */

/**
 * Validate that a message has the required structure
 */
export function validateMessageStructure(message: any): message is WSClientMessage {
	if (!message || typeof message !== 'object') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Message must be an object"
		);
	}
	
	if (!message.type || typeof message.type !== 'string') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Message must have a 'type' field of type string"
		);
	}
	
	if (!message.data || typeof message.data !== 'object') {
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
export function validateSubscribeData(data: any): void {
	if (!data.room || typeof data.room !== 'string') {
		throw new WSError(
			WS_ERROR_CODE.MISSING_REQUIRED_FIELD,
			"Subscribe message must have a 'room' field of type string"
		);
	}
	
	if (data.room.length === 0) {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Room name cannot be empty"
		);
	}
}

/**
 * Validate unsubscribe message data
 */
export function validateUnsubscribeData(data: any): void {
	if (!data.room || typeof data.room !== 'string') {
		throw new WSError(
			WS_ERROR_CODE.MISSING_REQUIRED_FIELD,
			"Unsubscribe message must have a 'room' field of type string"
		);
	}
	
	if (data.room.length === 0) {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Room name cannot be empty"
		);
	}
}

/**
 * Validate ping message data (optional timestamp)
 */
export function validatePingData(data: any): void {
	if (data.timestamp !== undefined && typeof data.timestamp !== 'number') {
		throw new WSError(
			WS_ERROR_CODE.INVALID_MESSAGE,
			"Ping timestamp must be a number if provided"
		);
	}
}

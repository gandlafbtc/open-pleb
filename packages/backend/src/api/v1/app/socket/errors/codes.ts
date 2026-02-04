/**
 * WebSocket error codes
 * Re-exported from common package for consistency
 */
export { WS_ERROR_CODE } from "common/ws-types";

/**
 * Error code descriptions for debugging
 */
export const ERROR_DESCRIPTIONS = {
	INVALID_MESSAGE: "The message format is invalid or malformed",
	MISSING_REQUIRED_FIELD: "A required field is missing from the message",
	UNAUTHORIZED: "Authentication is required but not provided",
	FORBIDDEN: "You don't have permission to access this resource",
	ROOM_NOT_FOUND: "The requested room does not exist",
	ALREADY_SUBSCRIBED: "Already subscribed to this room",
	NOT_SUBSCRIBED: "Not subscribed to this room",
	INTERNAL_ERROR: "An internal server error occurred",
	RATE_LIMIT_EXCEEDED: "Too many requests, please slow down",
	INVALID_COMMAND: "The command is not recognized"
} as const;

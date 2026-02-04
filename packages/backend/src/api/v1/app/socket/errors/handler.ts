import type { ServerWebSocket } from "bun";
import { WS_COMMAND, WS_ERROR_CODE, type WSErrorCode, type WSErrorResponse } from "common/ws-types";
import { ContextError } from "../../../../../util/errors";
import { log } from "../../../../../util/logger";

export class WSError extends ContextError {
	code: WSErrorCode;

	constructor(code: WSErrorCode, message: string, context?: any) {
		super(message, { context });
		this.code = code;
		this.name = "WSError";
	}
}

export class WSErrorHandler {
	static send(
		ws: ServerWebSocket<any>,
		error: Error | WSError,
		requestType?: string
	): void {
		const code = error instanceof WSError ? error.code : WS_ERROR_CODE.INTERNAL_ERROR;
		const response: WSErrorResponse = {
			type: WS_COMMAND.ERROR,
			data: {
				code,
				message: error.message,
				requestType,
				details: (error instanceof ContextError ? error.context : undefined) as Record<string, unknown> | undefined,
			},
		};

		try {
			ws.send(JSON.stringify(response));
			log.error(`WebSocket error [${code}]: ${error.message} ${requestType}`);
		} catch (sendError) {
			log.error`Failed to send error response: ${sendError}`;
		}
	}
}

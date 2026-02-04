import type { CommandHandler } from "./registry";
import { WSError } from "../errors/handler";
import { WS_ERROR_CODE, WS_COMMAND } from "common/ws-types";
import type { UnsubscribeData } from "common/ws-types";
import { log } from "../../../../../util/logger";

export const handleUnsubscribe: CommandHandler = async (ws, message, roomManager) => {
	const data = message.data as UnsubscribeData;
	
	if (!data.room) {
		throw new WSError(WS_ERROR_CODE.MISSING_REQUIRED_FIELD, "Missing room field");
	}

	try {
		roomManager.unsubscribe(ws, data.room);
		
		// Send success response
		ws.send(JSON.stringify({
			type: WS_COMMAND.UNSUBSCRIBED,
			data: {
				room: data.room,
				timestamp: Date.now()
			}
		}));
		
		log.info`WebSocket ${ws.id} unsubscribed from ${data.room}`;
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("not found")) {
				throw new WSError(WS_ERROR_CODE.ROOM_NOT_FOUND, error.message);
			}
			if (error.message.includes("Not subscribed")) {
				throw new WSError(WS_ERROR_CODE.NOT_SUBSCRIBED, error.message);
			}
		}
		throw error;
	}
};

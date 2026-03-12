import { ensureError } from "@openPleb/common/errors";
import Elysia from "elysia";
import type { ElysiaWS } from "elysia/ws";
import { log } from "../../../../util/logger";


export const authWS = new Elysia().ws("/ws", {
	//@ts-expect-error jwt inject
	beforeHandle: async ({ headers, set, jwt }) => {
		const authHeader = headers["sec-websocket-protocol"];
		log.debug(`Authorizing websocket connection...`);
		if (!authHeader) {
			log.warn(`Authorization token not set`);
			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: {},
			};
		}
		const { userId } = await jwt.verify(authHeader);
		if (!userId) {
			log.warn(`User param not found in token: ${authHeader}`);

			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: null,
			};
		}

		
		if (userId !== Bun.env.OPENPLEB_ADMIN_NPUB) {
			log.warn(`No such admin user: ${userId}`);
			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: null,
			};
		}
		log.debug(`Authorized websocket: ${userId}`);
	},

	open: (ws) => {
		
	},
	message(ws, message) {
		//receiving messages
		try {
			handleCommand(message);
		} catch (error) {
			const err = ensureError(error);
			log.error("Error: {error}", { error });
		}
	},
});

const sendPing = async (ws: ElysiaWS) => {
	ws.send({ command: "ping", data: {} });
	// log.debug(`sent websocket ping {pingData}`, {pingData} )
};
const handleCommand = async (message: { command: string; data: unknown }) => {
	// log.debug(`Received websocket command: {message}`, {message} )
	switch (message.command) {
		case "pong":
			break;
		default:
			log.warn("Unknown websocket command {message}", { message });
			break;
	}
};

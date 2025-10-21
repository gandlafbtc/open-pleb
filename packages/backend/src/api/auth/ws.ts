import { userTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import type { ElysiaWS } from "elysia/ws";
import { db } from "../../db/db";
import { takeUniqueOrUndefinded } from "../../db/orm-helper";
import { eventEmitter } from "../../events/emitter";
import { log } from "../../logger";
import type { SocketEventData } from "../../types";

export const authWS = new Elysia().ws("/ws", {
	//@ts-ignore
	beforeHandle: async ({ headers, request, set, jwt }) => {
		const authHeader = headers["sec-websocket-protocol"];
		log.debug`Authorizing websocket connection...`;
		if (!authHeader) {
			log.warn`Authorization token not set`;
			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: {},
			};
		}
		const { userId } = await jwt.verify(authHeader);
		if (!userId) {
			log.warn`User param not found in token: ${authHeader}`;

			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: null,
			};
		}

		const user = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, userId))
			.then(takeUniqueOrUndefinded);

		if (!user) {
			log.warn`No such user: ${userId}`;
			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: null,
			};
		}
		log.debug`Authorized websocket: ${userId}`;
	},

	open: (ws) => {
		try {
			ws.subscribe("message");
			sendPing(ws);
			setInterval(async () => {
				sendPing(ws);
			}, 10000);
			eventEmitter.on("socket-event", (e: SocketEventData) => {
				log.debug("Sending socket event {e}", { e });
				ws.send(e);
			});
		} catch (error) {
			const err = ensureError(error);
			log.error("Error: {error}", { error });
		}
	},
	message(ws, message: string) {
		//receiving messages
		try {
			//@ts-ignore
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

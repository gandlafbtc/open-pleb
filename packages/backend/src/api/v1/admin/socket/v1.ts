import { userTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import type { ElysiaWS } from "elysia/ws";
import { log } from "../../../../util/logger";
import { takeUniqueOrUndefinded } from "../../../../util/orm-helper";
import { db } from "../../../../db/db";

export const v1WSA = new Elysia().ws("/wsa", {
    //@ts-ignore
    beforeHandle: async ({ headers, request, set, jwt }) => {
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

        const user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, userId))
            .then(takeUniqueOrUndefinded);

        if (!user) {
            log.warn(`No such user: ${userId}`);
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

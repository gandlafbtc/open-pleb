import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import type Elysia from "elysia";
import type { ElysiaWS } from "elysia/ws";

import { db } from "@openPleb/common/db";
import { offerTable, userTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { desc } from "drizzle-orm";
import { takeUniqueOrUndefinded } from "../../db/orm-helpers/orm-helper";
import { environment } from "../../env";
import { eventEmitter } from "../../events/emitter";
import { log } from "../../logger";
import type { SocketEventData } from "../../types";
import { resolveDispute } from "../api/offers/resolveDispute";
import { authFiatProviders } from "./fiat_providers/crud";
import { isAuthenticated } from "./middleware";
export const auth = (app: Elysia) =>
	app
		//@ts-ignore
		.post("/signup", async ({ body, set, jwt }) => {
			try {
				const { password, username } = body as {
					username: string;
					password: string;
				};
				const hasUser = (await db.select().from(userTable)).length;
				if (hasUser) {
					set.status = 400;
					return {
						success: false,
						data: null,
						message: "Already create an user",
					};
				}
				// validate duplicate email address
				const exists = await db
					.select()
					.from(userTable)
					.where(eq(userTable.username, username))
					.then(takeUniqueOrUndefinded);
				if (exists) {
					set.status = 400;
					return {
						success: false,
						data: null,
						message: "User already exists",
					};
				}
				const passwordHash = await hash(password);
				// handle password
				const newUser = await db.insert(userTable).values({
					passwordHash,
					username,
					createdAt: Math.ceil(Date.now() / 1000),
				});
				// generate access
				const user = await db
					.select()
					.from(userTable)
					.where(eq(userTable.username, username))
					.then(takeUniqueOrUndefinded);
				if (!user) {
					set.status = 400;
					return {
						success: false,
						data: null,
						message: "Could not create user",
					};
				}
				const signature = await jwt.sign({
					userId: user.id,
				});

				return {
					success: true,
					data: {
						user: {
							access_token: signature,
							id: user.id,
							username: user.username,
						},
					},
					message: "Account created",
				};
			} catch (error) {
				set.status = 400;
				const err = ensureError(error);
				log.error("Error: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: {},
				};
			}
		})
		//@ts-ignore
		.post("/login", async ({ body, set, jwt }) => {
			try {
				const { username, password } = body as {
					username: string;
					password: string;
				};
				// verify email/username
				const user = await db
					.select()
					.from(userTable)
					.where(eq(userTable.username, username))
					.then(takeUniqueOrUndefinded);
				if (!user) {
					set.status = 400;
					return {
						success: false,
						data: null,
						message: "Invalid credentials",
					};
				}

				// verify password
				const match = await verify(user.passwordHash, password);
				if (!match) {
					set.status = 400;
					return {
						success: false,
						data: null,
						message: "Invalid credentials",
					};
				}

				// generate access
				const signature = await jwt.sign({
					userId: user.id,
				});

				return {
					success: true,
					data: {
						user: {
							access_token: signature,
							id: user.id,
							username: user.username,
						},
					},
					message: "Login successful",
				};
			} catch (error) {
				set.status = 400;
				const err = ensureError(error);
				log.error("Error: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: {},
				};
			}
		})
		.use(isAuthenticated)
		// protected routes
		.get("/data", async ({ user, set }) => {
			try {
				if (!user) {
					return;
				}
				//todo prioritize disputed offers
				const offers = await db
					.select()
					.from(offerTable)
					.orderBy(desc(offerTable.createdAt))
					.limit(100);
				return { offers, env: environment };
			} catch (error) {
				set.status = 400;
				const err = ensureError(error);
				log.error("Error: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: {},
				};
			}
		})
		.post("/resolvedispute", async ({ user, body, set }) => {
			try {
				if (!user) {
					return;
				}
				await resolveDispute(body);
				console.log(body);
				return {};
			} catch (error) {
				set.status = 400;
				const err = ensureError(error);
				log.error("Error: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: {},
				};
			}
		})
		.use(authFiatProviders)
		.ws("/ws", {
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

import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import type Elysia from "elysia";

import { db } from "@openPleb/common/db";
import { userTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { takeUniqueOrUndefinded } from "../../db/orm-helper";
import { log } from "../../logger";
import { isAuthenticated } from "./middleware";
import { protectedRoutes } from "./protectedRoutes";
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
		.use(protectedRoutes);

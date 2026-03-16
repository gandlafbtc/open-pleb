import type Elysia from "elysia";
import { log } from "../../../../util/logger";

export const isAuthenticated = (app: Elysia) =>
	//@ts-expect-error jwt
	app.onBeforeHandle(async ({ jwt, set, headers }) => {
		log.debug(`Accessing protected endpoint...`);
		const auth = headers.authorization;
		const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
		if (!token) {
			log.warn(`Authorization token not set`);
			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: null,
			};
		}

		const { userId } = await jwt.verify(token);
		if (!userId) {
			log.warn(`User param not found in token: ${token}`);
			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: null,
			};
		}

		if (userId !== Bun.env.OPENPLEB_ADMIN_NPUB) {
			log.warn(`No such admin: ${userId}`);
			set.status = 401;
			return {
				success: false,
				message: "Unauthorized",
				data: null,
			};
		}
		log.debug(`Authorized: ${userId}`);
		// Don't return anything on success - let the request continue to the route handler
	});

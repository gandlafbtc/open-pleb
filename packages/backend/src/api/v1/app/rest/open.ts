import Elysia from "elysia";
import { userApi } from "./user/user.api";
import { getEnv } from "./general/get-env.api";
import { getConversionRate } from "./general/conversion-rate.api";
import { authApi } from "./auth/auth";
import { offerApi } from "./offer/offer.api";
import { providersApi } from "./provider/provider.api";

export const open = (app: Elysia) =>
	app
		.use(getConversionRate)
		.use(getEnv)
		.use(authApi)
		.use(offerApi)
		.use(providersApi)
		.group("/user", (app)=> app.use(userApi))
	;

import { Elysia } from "elysia";
import { batApi } from "./bat.api";

export const authApi = new Elysia({ prefix: "/auth" })
	.use(batApi);

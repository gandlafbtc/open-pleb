import Elysia from "elysia";
import { generateCodes } from "./generate-codes.api";
import { getUsers } from "./get-users.api";

export const admin = (app: Elysia) =>
	app
	.use(generateCodes)
	.use(getUsers)

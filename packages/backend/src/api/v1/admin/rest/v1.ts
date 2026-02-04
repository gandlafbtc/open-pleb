import Elysia from "elysia";
import { admin } from "./admin";


export const v1Admin = new Elysia().group("/api/v1/admin", (app) =>
	app.use(admin)
);

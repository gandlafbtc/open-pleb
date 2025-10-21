import Elysia from "elysia";
import { open } from "../../server/open";
import { adminAPI } from "./admin";
import { subsAPI } from "./subs";

export const openAPI = new Elysia().group("/api/v1", (app) => app.use(open)    .use(subsAPI)
    .use(adminAPI))
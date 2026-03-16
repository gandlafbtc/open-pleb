import Elysia from "elysia";
import { isUserInvited } from "./userInvited.api";
import { registerUser } from "./registerUser.api";
export const userApi = (app: Elysia) =>
    app
    .use(isUserInvited)
    .use(registerUser)

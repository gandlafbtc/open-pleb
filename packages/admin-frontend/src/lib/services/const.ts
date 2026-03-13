import { env } from "$env/dynamic/public";
const { PUBLIC_ADMIN_BACKEND_URL, PUBLIC_API_VERSION } = env;
export const ADMIN_API_BASE_URL = `${PUBLIC_ADMIN_BACKEND_URL}/api/${PUBLIC_API_VERSION}/admin`;
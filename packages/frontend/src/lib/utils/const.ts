import { type FiatProvider } from "common/db/schema";

export const UNKNOWN_PROVIDER: FiatProvider = {
    createdAt: Date.now(),
    label: 'UNKNOWN',
    icon: "",
    id: 0,
    matchTemplate: ""
}
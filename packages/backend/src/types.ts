export type SocketEventData = {
	command: string;
	data: unknown;
	pubkeys?: string[];
};

export const InternalProofState = {
	PENDING: "PENDING",
	SPENT: "SPENT",
	UNSPENT: "UNSPENT",
};